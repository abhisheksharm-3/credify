import cv2
import numpy as np
from typing import Union
from PIL import Image
from io import BytesIO
import imghdr
from fastapi import HTTPException
from app.utils.file_utils import get_file_content

SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp']

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

def detect_face(image_content: bytes) -> bool:
    nparr = np.frombuffer(image_content, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    return len(faces) > 0