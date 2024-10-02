
import numpy as np
import librosa as lb
from tensorflow.keras.models import load_model
import traceback
from app.utils.file_utils import get_file_content
import io
import logging

class AudioDeepfakeService:
    def __init__(self):
        logging.info("Initializing AudioDeepfakeService")
        self.model = load_model("models/DeepFakeVoiceDetector_V1.h5")
        logging.info("AudioDeepfakeService model loaded successfully")

    def create_mel_spectrogram_sample(self, audio_content, sr=22050, sample_time=1.5, n_mels=64):
        logging.info("Creating mel spectrogram sample")
        try:
            y, sr = lb.load(io.BytesIO(audio_content), sr=sr)
            logging.info(f"Audio loaded with sample rate: {sr}, length: {len(y)}")

            sample_length = int(sr * sample_time)
            if len(y) < sample_length:
                logging.warning(f"Audio file is too short. Padding from {len(y)} to {sample_length}")
                y = np.pad(y, (0, sample_length - len(y)), mode='constant')

            start = 0
            end = start + sample_length
            m = lb.feature.melspectrogram(y=y[start:end], sr=sr, n_mels=n_mels)
            m = np.abs(m)
            m = lb.power_to_db(m, ref=np.max)  # Convert to dB scale
            m = (m - m.min()) / (m.max() - m.min())  # Normalize to [0, 1]
            logging.info("Mel spectrogram sample created successfully")
            return np.expand_dims(m, axis=-1)
        except Exception as e:
            logging.error(f"Error creating mel spectrogram: {str(e)}")
            logging.error(traceback.format_exc())
            return None

    def detect_deepfake(self, firebase_filename):
        logging.info(f"Detecting deepfake for audio file: {firebase_filename}")
        try:
            audio_content = get_file_content(firebase_filename)
            logging.info(f"Audio content retrieved successfully, size: {len(audio_content)} bytes")

            sample = self.create_mel_spectrogram_sample(audio_content)
            if sample is None:
                logging.error("Failed to create mel spectrogram sample")
                return {"prediction": "Error", "confidence": 0.0, "raw_prediction": 0.0}

            logging.info("Mel spectrogram sample created")
            prediction = self.model.predict(np.expand_dims(sample, axis=0))[0][0]
            logging.info(f"Raw prediction: {prediction}")

            is_fake = prediction > 0.5
            confidence = prediction if is_fake else 1 - prediction

            result = "Fake" if is_fake else "Real"

            result_dict = {
                "prediction": result,
                "confidence": float(confidence),
                "raw_prediction": float(prediction)
            }
            logging.info(f"Deepfake detection result: {result_dict}")
            return result_dict

        except Exception as e:
            logging.error(f"Error processing audio: {str(e)}")
            logging.error(traceback.format_exc())
            return {"prediction": "Error", "confidence": 0.0, "raw_prediction": 0.0}