import tensorflow as tf
import numpy as np
import cv2
from app.utils.file_utils import get_file_content
import io

class DeepfakeVideoDetectionService:
    def __init__(self):
        self.model = tf.keras.models.load_model("models/deepfake_videos.h5")

    def process_frame(self, frame):
        frame = cv2.resize(frame, (224, 224))
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame = tf.keras.applications.xception.preprocess_input(tf.convert_to_tensor(frame, dtype=tf.float32))
        return np.expand_dims(frame, axis=0)

    def calculate_weighted_average(self, predictions, threshold=0.5):
        weights = np.maximum(predictions - threshold, 0)
        if np.sum(weights) == 0:
            return np.mean(predictions)
        else:
            return np.average(predictions, weights=weights)

    def detect_deepfake(self, frame_filenames):
        predictions = []
        for filename in frame_filenames:
            frame_content = get_file_content(filename)
            frame = cv2.imdecode(np.frombuffer(frame_content, np.uint8), cv2.IMREAD_COLOR)
            processed_frame = self.process_frame(frame)
            prediction = float(self.model.predict(processed_frame, verbose=0)[0][0])
            predictions.append(prediction)

        predictions = np.array(predictions)
        weighted_avg_confidence = self.calculate_weighted_average(predictions)
        is_fake = weighted_avg_confidence > 0.5

        return {
            "is_deepfake": is_fake,
            "confidence": float(weighted_avg_confidence),
            "max_confidence": float(np.max(predictions)),
            "min_confidence": float(np.min(predictions)),
            "frames_analyzed": len(predictions)
        }