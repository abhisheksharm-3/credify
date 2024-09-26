import numpy as np
import librosa as lb
from tensorflow.keras.models import load_model
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
        y, sr = lb.load(io.BytesIO(audio_content), sr=sr)
        logging.info(f"Audio loaded with sample rate: {sr}")

        sample_length = int(sr * sample_time)
        if len(y) < sample_length:
            logging.warning("Audio file is too short")
            raise ValueError("Audio file is too short")

        start = 0
        end = start + sample_length
        m = lb.feature.melspectrogram(y=y[start:end], sr=sr, n_mels=n_mels)
        m = np.abs(m)
        m /= 80
        logging.info("Mel spectrogram sample created successfully")
        return np.expand_dims(m, axis=-1)

    def detect_deepfake(self, firebase_filename):
        logging.info(f"Detecting deepfake for audio file: {firebase_filename}")
        try:
            audio_content = get_file_content(firebase_filename)
            logging.info("Audio content retrieved successfully")
            sample = self.create_mel_spectrogram_sample(audio_content)
            logging.info("Mel spectrogram sample created")
            prediction = self.model.predict(np.expand_dims(sample, axis=0))[0][0]
            logging.info(f"Raw prediction: {prediction}")

            result = "Fake" if prediction > 0.5 else "Real"
            confidence = prediction if prediction > 0.5 else 1 - prediction

            result_dict = {
                "prediction": result,
                "confidence": float(confidence),
                "raw_prediction": float(prediction)
            }
            logging.info(f"Deepfake detection result: {result_dict}")
            return result_dict

        except Exception as e:
            logging.error(f"Error processing audio: {str(e)}")
            raise ValueError(f"Error processing audio: {str(e)}")