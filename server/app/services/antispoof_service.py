import logging
from app.core.config import MODEL_PATH, CONFIG_PATH
from app.utils.file_utils import download_file, remove_temp_file
from fastapi import HTTPException
from app.core.firebase_config import firebase_bucket
from io import BytesIO
from PIL import Image
import tensorflow as tf
import json
import numpy as np

class AntispoofService:
    def __init__(self):
        self.model = None
        self.config = None
        self.load_model_and_config()

    def load_model_and_config(self):
        try:
            self.model = tf.keras.models.load_model(MODEL_PATH)
            with open(CONFIG_PATH, "r") as config_file:
                self.config = json.load(config_file)
            logging.info("Model and configuration loaded successfully.")
        except Exception as e:
            logging.error(f"Error loading model or config: {str(e)}")
            raise

    async def verify_liveness(self, image_url: str):
        if self.model is None or self.config is None:
            raise ValueError("Model or configuration not loaded")

        firebase_filename = None
        try:
            firebase_filename = await download_file(image_url)
            
            blob = firebase_bucket.blob(firebase_filename)
            image_bytes = blob.download_as_bytes()
            
            image = Image.open(BytesIO(image_bytes))
            image = image.resize((self.config["img_width"], self.config["img_height"]))
            image_array = np.array(image) / 255.0
            image_array = np.expand_dims(image_array, axis=0)

            prediction = self.model.predict(image_array)[0][0]

            is_real = bool(prediction <= self.config["threshold"])
            result = "Real" if is_real else "Spoof"

            return {
                "image_url": image_url,
                "prediction_score": float(prediction),
                "is_real": is_real,
                "result": result
            }
        except Exception as e:
            logging.error(f"Error processing image: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
        finally:
            if firebase_filename:
                await remove_temp_file(firebase_filename)

antispoof_service = AntispoofService()