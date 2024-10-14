import cv2
import numpy as np
from typing import Union
from PIL import Image
from io import BytesIO
import imghdr
from fastapi import HTTPException
from app.utils.file_utils import get_file_content

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

def perceptual_image_hash(image: Union[str, np.ndarray, Image.Image], hash_size: int = 32) -> str:
    processed_image = preprocess_image(image, hash_size)
    dct = cv2.dct(np.float32(processed_image))
    dct_low = dct[:8, :8]
    median = np.median(dct_low[1:])
    
    hash_value = ''
    for i in range(8):
        for j in range(8):
            hash_value += '1' if dct_low[i, j] > median else '0'
    
    return hash_value

def hamming_distance(hash1: str, hash2: str) -> int:
    return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))

def are_images_similar(hash1: str, hash2: str, threshold: int = 5) -> bool:
    distance = hamming_distance(hash1, hash2)
    return distance <= threshold

def process_image(filename: str):
    try:
        content = get_file_content(filename)
        img = Image.open(BytesIO(content))
        image_hash = perceptual_image_hash(img)
        
        return image_hash
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

def compare_images(filename1: str, filename2: str):
    try:
        content1 = get_file_content(filename1)
        content2 = get_file_content(filename2)
        img1 = Image.open(BytesIO(content1))
        img2 = Image.open(BytesIO(content2))
        hash1 = perceptual_image_hash(img1)
        hash2 = perceptual_image_hash(img2)
        
        are_similar = are_images_similar(hash1, hash2)
        distance = hamming_distance(hash1, hash2)
        
        return {
            "image1_hash": hash1,
            "image2_hash": hash2,
            "are_similar": are_similar,
            "hamming_distance": distance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing images: {str(e)}")
