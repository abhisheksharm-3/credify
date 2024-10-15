import cv2
import numpy as np
from typing import Union
from PIL import Image
from io import BytesIO
import imghdr
import cv2
import os
from fastapi import HTTPException
import io
from app.utils.file_utils import get_file_content
import logging

SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp']

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define the paths to the XML files
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
xml_paths = {
    'frontal': os.path.join(project_root, 'models', 'haarcascade_frontalface_default.xml'),
    'frontal_alt': os.path.join(project_root, 'models', 'haarcascade_frontalface_alt2.xml'),
    'profile': os.path.join(project_root, 'models', 'haarcascade_profileface.xml')
}

# Try to load the pre-trained face detection models
face_cascades = {}
for name, path in xml_paths.items():
    try:
        if not os.path.exists(path):
            logger.error(f"Error: XML file not found at {path}")
            continue
        cascade = cv2.CascadeClassifier(path)
        if cascade.empty():
            logger.error(f"Error: Unable to load the cascade classifier. XML file is empty or invalid: {path}")
        else:
            face_cascades[name] = cascade
            logger.info(f"Successfully loaded face detection model from: {path}")
    except Exception as e:
        logger.error(f"Error loading face detection model {name}: {str(e)}")
    
def verify_image_format(firebase_filename: str):
    content = get_file_content(firebase_filename)
    file_ext = '.' + (imghdr.what(BytesIO(content)) or '')
    if file_ext not in SUPPORTED_IMAGE_FORMATS:
        raise HTTPException(status_code=400, detail=f"Unsupported image format. Supported formats are: {', '.join(SUPPORTED_IMAGE_FORMATS)}")

def preprocess_image(image: Union[str, np.ndarray, Image.Image], hash_size: int = 32) -> np.ndarray:
    if isinstance(image, str):
        content = get_file_content(image)
        img = Image.open(BytesIO(content))
        img = strip_metadata(img)
        image = np.array(img)
    elif isinstance(image, Image.Image):
        image = strip_metadata(image)
        image = np.array(image)
    
    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    
    image = cv2.resize(image, (hash_size, hash_size), interpolation=cv2.INTER_AREA)
    image = cv2.normalize(image, None, 0, 255, cv2.NORM_MINMAX)
    return image

def strip_metadata(img: Image.Image) -> Image.Image:
    data = list(img.getdata())
    img_without_exif = Image.new(img.mode, img.size)
    img_without_exif.putdata(data)
    return img_without_exif

def detect_face(image_input) -> bool:
    """
    Enhanced face detection using cascaded classifiers.
    Args:
        image_input: Either raw image bytes or a filename
    Returns:
        bool: True if any faces are detected, False otherwise
    """
    try:
        # Determine if the input is bytes or a filename
        if isinstance(image_input, bytes):
            # Decode image from bytes
            nparr = np.frombuffer(image_input, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        elif isinstance(image_input, str):
            # Read image from file
            img = cv2.imread(image_input)
        else:
            logger.error("Invalid input type for detect_face")
            return False

        if img is None:
            logger.error("Failed to load image in detect_face")
            return False

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Enhance contrast to help with detection
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced_gray = clahe.apply(gray)
        
        # Try each cascade classifier
        for name, cascade in face_cascades.items():
            faces = cascade.detectMultiScale(
                enhanced_gray,
                scaleFactor=1.1,
                minNeighbors=4,
                minSize=(30, 30)
            )
            if len(faces) > 0:
                logger.info(f"Face detected using {name} classifier")
                return True
        
        logger.info("No face detected")
        return False
    except Exception as e:
        logger.error(f"Error in detect_face: {str(e)}")
        return False