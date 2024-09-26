import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from app.utils.file_utils import get_file_content
import io

class GANDetectionService:
    def __init__(self):
        self.model = load_model('models/gan_model.h5')

    def load_and_preprocess_image(self, image_content, target_size=(256, 256)):
        img = image.load_img(io.BytesIO(image_content), target_size=target_size)
        img_array = image.img_to_array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def detect_gan(self, firebase_filename):
        image_content = get_file_content(firebase_filename)
        img_array = self.load_and_preprocess_image(image_content)
        prediction = self.model.predict(img_array)

        real_confidence = float(prediction[0][0] * 100)
        fake_confidence = float((1 - prediction[0][0]) * 100)

        return {
            "is_gan": fake_confidence > real_confidence,
            "real_confidence": real_confidence,
            "fake_confidence": fake_confidence
        }