import tensorflow as tf
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import json
from app.utils.file_utils import get_file_content
import io

class ImageManipulationService:
    def __init__(self):
        self.model = tf.keras.models.load_model('models/image_manipulation_detection_model.h5')

        with open('models/img_manipulation_class_names.json', 'r') as f:
            self.class_names = json.load(f)

        with open('models/img_man_preprocessing_params.json', 'r') as f:
            self.preprocessing_params = json.load(f)

    def convert_to_ela_image(self, image, quality):
        temp_buffer = io.BytesIO()
        image.save(temp_buffer, 'JPEG', quality=quality)
        temp_buffer.seek(0)
        temp_image = Image.open(temp_buffer)

        ela_image = ImageChops.difference(image, temp_image)

        extrema = ela_image.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        if max_diff == 0:
            max_diff = 1
        scale = 255.0 / max_diff

        ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)

        return ela_image

    def prepare_image(self, image_content):
        image = Image.open(io.BytesIO(image_content))
        ela_image = self.convert_to_ela_image(image, quality=90)
        ela_image = ela_image.resize((128, 128))
        return np.array(ela_image).flatten() / 255.0

    def detect_manipulation(self, firebase_filename):
        image_content = get_file_content(firebase_filename)
        prepared_image = self.prepare_image(image_content)
        prepared_image = prepared_image.reshape(-1, 128, 128, 3)

        prediction = self.model.predict(prepared_image)
        predicted_class = int(np.argmax(prediction, axis=1)[0])
        confidence = float(np.max(prediction) * 100)
        
        is_manipulated = bool(predicted_class == 0 and confidence > 90)

        result = {
            "class": self.class_names[predicted_class],
            "confidence": f"{confidence:.2f}%",
            "is_manipulated": is_manipulated
        }

        return result