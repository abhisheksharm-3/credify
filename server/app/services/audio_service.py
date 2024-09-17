import logging
import numpy as np
import librosa
import imagehash
from PIL import Image
import logging
import io
from pydub import AudioSegment

import ffmpeg
import numpy as np
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
def extract_audio_features(video_bytes):
    logger.info("Extracting audio features")
    try:
        # Attempt to extract audio using pydub
        try:
            logger.info("Attempting to extract audio using pydub")
            audio = AudioSegment.from_file(io.BytesIO(video_bytes), format="mp4")
            audio = audio.set_channels(1).set_frame_rate(44100)
            samples = audio.get_array_of_samples()
            audio_array = np.array(samples).astype(np.float32) / 32768.0
        except Exception as pydub_error:
            logger.warning(f"Pydub extraction failed: {str(pydub_error)}. Attempting ffmpeg extraction.")
            
            # Fallback to ffmpeg if pydub fails
            try:
                out, _ = (
                    ffmpeg
                    .input('pipe:0')
                    .output('pipe:1', format='f32le', acodec='pcm_f32le', ac=1, ar='44100')
                    .run(input=video_bytes, capture_stdout=True, capture_stderr=True)
                )
                audio_array = np.frombuffer(out, np.float32)
            except ffmpeg.Error as ffmpeg_error:
                logger.error(f"FFmpeg extraction failed: {ffmpeg_error.stderr.decode()}")
                raise

        # Extract MFCC features
        mfcc = librosa.feature.mfcc(y=audio_array, sr=44100, n_mfcc=13)
        
        logger.info("Audio features extracted successfully")
        return mfcc

    except Exception as e:
        logger.error(f"Error extracting audio features: {str(e)}", exc_info=True)
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
    logger.info("Computing audio hashes")
    try:
        out, _ = (
            ffmpeg
            .input('pipe:0')
            .output('pipe:1', format='f32le', acodec='pcm_f32le', ac=1, ar='44100')
            .run(input=video_bytes, capture_stdout=True, capture_stderr=True)
        )
        
        audio_array = np.frombuffer(out, np.float32)
        mfccs = librosa.feature.mfcc(y=audio_array, sr=44100, n_mfcc=13)
        
        audio_hashes = []
        for mfcc in mfccs.T:
            audio_hash = imagehash.average_hash(Image.fromarray(mfcc.reshape(13, 1)))
            audio_hashes.append(str(audio_hash))
        
        logger.info("Finished computing audio hashes.")
        return audio_hashes
    except ffmpeg.Error as e:
        logger.error(f"FFmpeg error in compute_audio_hashes: {e.stderr.decode()}")
        raise
    except Exception as e:
        logger.error(f"Error in compute_audio_hashes: {str(e)}", exc_info=True)
        raise