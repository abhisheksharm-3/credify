import cv2
import ffmpeg
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
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
def validate_video_bytes(video_bytes):
    try:
        # If video_bytes is already a BytesIO object, use it directly
        # Otherwise, create a new BytesIO object from the bytes
        if not isinstance(video_bytes, io.BytesIO):
            video_bytes = io.BytesIO(video_bytes)
        
        # Reset the BytesIO object to the beginning
        video_bytes.seek(0)
        
        # Create a temporary file to store the video data
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
            temp_file.write(video_bytes.read())
            temp_file_path = temp_file.name

        # Use ffprobe to get video information
        probe = ffmpeg.probe(temp_file_path)
        
        # Clean up the temporary file
        os.unlink(temp_file_path)
        
        # Check for audio stream
        audio_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'audio'), None)
        
        if audio_stream is None:
            logger.warning("No audio stream found in the file")
            return False
        return True
    except ffmpeg.Error as e:
        logger.error(f"Error validating video bytes: {e.stderr.decode()}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error in validate_video_bytes: {str(e)}")
        return False

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
        
        if validate_video_bytes(io.BytesIO(video_bytes)):
            audio_features = extract_audio_features(video_bytes)
            audio_hashes = compute_audio_hashes(video_bytes)
            collective_audio_hash = compute_audio_hash(audio_features)
        else:
            logging.warning("No audio stream found or invalid video. Skipping audio feature extraction.")
            audio_hashes = []
            collective_audio_hash = None
        
        video_hash = compute_video_hash(video_features)
        frame_hashes = compute_frame_hashes(firebase_filename)

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