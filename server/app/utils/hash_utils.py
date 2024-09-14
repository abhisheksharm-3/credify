import cv2
import numpy as np
import imagehash
from PIL import Image
import logging
from app.utils.file_utils import get_file_stream

def compute_video_hash(features):
    logging.info("Computing video hash.")
    return imagehash.phash(Image.fromarray(np.mean(features, axis=0).reshape(8, 8)))

import tempfile
import os

def compute_frame_hashes(firebase_filename):
    logging.info("Computing frame hashes")
    video_stream = get_file_stream(firebase_filename)
    video_bytes = video_stream.getvalue()
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
        temp_file.write(video_bytes)
        temp_file_path = temp_file.name

    cap = cv2.VideoCapture(temp_file_path)
    
    frame_hashes = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        img_hash = imagehash.average_hash(Image.fromarray(gray))
        frame_hashes.append(str(img_hash))
    
    cap.release()
    os.unlink(temp_file_path)
    
    logging.info("Finished computing frame hashes.")
    return frame_hashes