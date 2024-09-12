import numpy as np
import librosa
import imagehash
from PIL import Image
import logging
import io
from pydub import AudioSegment

import ffmpeg
import numpy as np

def extract_audio_features(video_bytes):
    logging.info("Extracting audio features")
    try:
        # Use ffmpeg to extract audio from video bytes
        out, _ = (
            ffmpeg
            .input('pipe:0')
            .output('pipe:1', format='f32le', acodec='pcm_f32le', ac=1, ar='44100')
            .run(input=video_bytes, capture_stdout=True, capture_stderr=True)
        )
        
        # Convert to numpy array
        audio_array = np.frombuffer(out, np.float32)
        
        # Extract MFCC features
        mfcc = librosa.feature.mfcc(y=audio_array, sr=44100, n_mfcc=13)
        
        return mfcc
    except Exception as e:
        logging.error(f"Error extracting audio features: {str(e)}")
        raise
    
def compute_audio_hash(features):
    logging.info("Computing audio hash.")
    if features is None:
        return None
    # Ensure the features are properly shaped for hashing
    features_2d = features.reshape(features.shape[0], -1)
    features_2d = (features_2d - np.min(features_2d)) / (np.max(features_2d) - np.min(features_2d))
    features_2d = (features_2d * 255).astype(np.uint8)
    return imagehash.phash(Image.fromarray(features_2d))

def compute_audio_hashes(video_bytes):
    logging.info("Computing audio hashes")
    audio = AudioSegment.from_file(io.BytesIO(video_bytes))
    samples = np.array(audio.get_array_of_samples())
    mfccs = librosa.feature.mfcc(y=samples.astype(float), sr=audio.frame_rate, n_mfcc=13)
    audio_hashes = []
    for mfcc in mfccs.T:
        audio_hash = imagehash.average_hash(Image.fromarray(mfcc.reshape(13, 1)))
        audio_hashes.append(str(audio_hash))
    logging.info("Finished computing audio hashes.")
    return audio_hashes