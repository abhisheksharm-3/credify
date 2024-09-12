import cv2
import numpy as np
from scipy.fftpack import dct
import imagehash
from PIL import Image
import logging
import logging
from app.utils.hash_utils import compute_video_hash, compute_frame_hashes
from app.services.audio_service import extract_audio_features, compute_audio_hash, compute_audio_hashes
from app.utils.file_utils import download_file, remove_temp_file, get_file_stream
import io

import tempfile
import os

async def extract_video_features(firebase_filename):
    logging.info("Extracting video features")
    video_stream = get_file_stream(firebase_filename)
    video_bytes = video_stream.getvalue()
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
        temp_file.write(video_bytes)
        temp_file_path = temp_file.name

    cap = cv2.VideoCapture(temp_file_path)
    
    features = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, (32, 32))
        dct_frame = dct(dct(resized.T, norm='ortho').T, norm='ortho')
        features.append(dct_frame[:8, :8].flatten())
    
    cap.release()
    os.unlink(temp_file_path)
    
    logging.info("Finished extracting video features.")
    return np.array(features), video_bytes

async def fingerprint_video(video_url):
    logging.info(f"Fingerprinting video: {video_url}")
    firebase_filename = None
    try:
        firebase_filename = await download_file(video_url)
        video_stream = get_file_stream(firebase_filename)
        video_bytes = video_stream.getvalue()
        
        video_features, _ = await extract_video_features(firebase_filename)
        
        audio_features = extract_audio_features(video_bytes)
        
        video_hash = compute_video_hash(video_features)
        frame_hashes = compute_frame_hashes(firebase_filename)
        audio_hashes = compute_audio_hashes(video_bytes)
        
        collective_audio_hash = compute_audio_hash(audio_features)

        logging.info("Finished fingerprinting video.")

        return {
            'frame_hashes': frame_hashes,
            'audio_hashes': audio_hashes,
            'robust_audio_hash': str(collective_audio_hash) if collective_audio_hash else None,
            'robust_video_hash': str(video_hash),
        }
    finally:
        if firebase_filename:
            await remove_temp_file(firebase_filename)

async def compare_videos(video_url1, video_url2):
    fp1 = await fingerprint_video(video_url1)
    fp2 = await fingerprint_video(video_url2)

    video_similarity = 1 - (imagehash.hex_to_hash(fp1['robust_video_hash']) - imagehash.hex_to_hash(fp2['robust_video_hash'])) / 64.0
    audio_similarity = 1 - (imagehash.hex_to_hash(fp1['robust_audio_hash']) - imagehash.hex_to_hash(fp2['robust_audio_hash'])) / 64.0

    overall_similarity = (video_similarity + audio_similarity) / 2
    is_same_content = overall_similarity > 0.9  # You can adjust this threshold

    logging.info(f"Comparison result - Video Similarity: {video_similarity}, Audio Similarity: {audio_similarity}, Overall Similarity: {overall_similarity}, Is Same Content: {is_same_content}")

    return {
        "video_similarity": video_similarity,
        "audio_similarity": audio_similarity,
        "overall_similarity": overall_similarity,
        "is_same_content": is_same_content
    }