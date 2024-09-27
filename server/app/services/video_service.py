import numpy as np
from scipy.fftpack import dct
import imagehash
from PIL import Image
import logging
import io
import av
from app.utils.hash_utils import compute_video_hash, compute_frame_hashes
from app.services.audio_service import extract_audio_features, compute_audio_hash, compute_audio_hashes
from app.utils.file_utils import download_file, remove_temp_file, get_file_content
from app.core.firebase_config import firebase_bucket

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def validate_video_bytes(video_bytes):
    try:
        with av.open(io.BytesIO(video_bytes)) as container:
            has_video = any(stream.type == 'video' for stream in container.streams)
            has_audio = any(stream.type == 'audio' for stream in container.streams)
            
            if not has_video:
                raise ValueError("No video stream found in the file")
            
            if not has_audio:
                logger.warning("No audio stream found in the file")
            
            return has_audio
    except Exception as e:
        logger.error(f"Error validating video bytes: {str(e)}")
        return False

async def extract_video_features(video_content):
    logging.info("Extracting video features")
    
    try:
        with av.open(io.BytesIO(video_content)) as container:
            video_stream = next(s for s in container.streams if s.type == 'video')
            features = []
            
            for frame in container.decode(video=0):
                img = frame.to_image().convert('L')  # Convert to grayscale
                resized = np.array(img.resize((32, 32)))
                dct_frame = dct(dct(resized.T, norm='ortho').T, norm='ortho')
                features.append(dct_frame[:8, :8].flatten())
        
    except Exception as e:
        logger.error(f"Error extracting video features: {str(e)}")
        raise
    
    logging.info("Finished extracting video features.")
    return np.array(features)

async def fingerprint_video(video_url):
    logging.info(f"Fingerprinting video: {video_url}")
    firebase_filename = None
    try:
        firebase_filename = await download_file(video_url)
        video_content = get_file_content(firebase_filename)
        
        video_features = await extract_video_features(video_content)
        
        if validate_video_bytes(video_content):
            audio_features = extract_audio_features(video_content)
            audio_hashes = compute_audio_hashes(video_content)
            collective_audio_hash = compute_audio_hash(audio_features)
        else:
            logging.warning("No audio stream found or invalid video. Skipping audio feature extraction.")
            audio_hashes = []
            collective_audio_hash = None
        
        video_hash = compute_video_hash(video_features)
        frame_hashes = compute_frame_hashes(video_content)

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
    audio_similarity = 1 - (imagehash.hex_to_hash(fp1['robust_audio_hash']) - imagehash.hex_to_hash(fp2['robust_audio_hash'])) / 64.0 if fp1['robust_audio_hash'] and fp2['robust_audio_hash'] else 0

    overall_similarity = (video_similarity + audio_similarity) / 2
    is_same_content = overall_similarity > 0.9  # You can adjust this threshold

    logging.info(f"Comparison result - Video Similarity: {video_similarity}, Audio Similarity: {audio_similarity}, Overall Similarity: {overall_similarity}, Is Same Content: {is_same_content}")

    return {
        "video_similarity": video_similarity,
        "audio_similarity": audio_similarity,
        "overall_similarity": overall_similarity,
        "is_same_content": is_same_content
    }