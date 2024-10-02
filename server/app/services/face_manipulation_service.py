import torch
import json
from pathlib import Path
from PIL import Image
from transformers import ViTForImageClassification, ViTImageProcessor
from app.utils.file_utils import get_file_content
import io
import logging

class FaceManipulationService:
    def __init__(self):
        logging.info("Initializing FaceManipulationService")
        self.device = torch.device('cpu')
        logging.info(f"Using device: {self.device}")

        model_config = json.loads(Path("models/deepfake_model_config.json").read_text())
        self.image_params = json.loads(Path("models/deepfake_image_params.json").read_text())
        label_mappings = json.loads(Path("models/deepfake_label_mappings.json").read_text())
        logging.info("Configuration files loaded successfully")

        self.model = ViTForImageClassification.from_pretrained("models/deepfake_model", num_labels=model_config["num_labels"])
        self.model.load_state_dict(torch.load("models/deepfake_model.pth", map_location=self.device))
        self.model.to(self.device)
        self.model.eval()
        logging.info("Face manipulation detection model loaded and set to evaluation mode")

        self.id2label = {int(k): v for k, v in label_mappings["id2label"].items()}
        logging.info(f"Label mappings: {self.id2label}")

        self.processor = ViTImageProcessor(
            size=self.image_params["size"],
            image_mean=self.image_params["mean"],
            image_std=self.image_params["std"]
        )
        logging.info("Image processor initialized")

    def predict_image(self, firebase_filename):
        try:
            logging.info(f"Predicting image manipulation for: {firebase_filename}")
            image_content = get_file_content(firebase_filename)
            logging.info("Image content retrieved successfully")
            
            image = Image.open(io.BytesIO(image_content)).convert('RGB')
            logging.info(f"Image opened and converted to RGB. Size: {image.size}, Mode: {image.mode}")
            
            inputs = self.processor(images=image, return_tensors="pt").to(self.device)
            logging.info("Image processed and inputs prepared")
            
            with torch.no_grad():
                outputs = self.model(**inputs)
            logging.info("Model inference completed")
            
            probs = outputs.logits.softmax(1)
            pred_class = probs.argmax().item()
            confidence = probs[0][pred_class].item()
            predicted_label = self.id2label[pred_class]
            logging.info(f"Prediction: Class {pred_class}, Label: {predicted_label}, Confidence: {confidence}")
            
            return predicted_label, confidence
        
        except Exception as e:
            logging.error(f"Error in predict_image: {str(e)}")
            logging.error(f"Image details - Size: {image.size if 'image' in locals() else 'N/A'}, Mode: {image.mode if 'image' in locals() else 'N/A'}")
            raise

    def detect_manipulation(self, firebase_filename):
        logging.info(f"Detecting face manipulation for: {firebase_filename}")
        label, confidence = self.predict_image(firebase_filename)
        is_deepfake = label == "Fake"

        result = {
            "is_deepfake": is_deepfake,
            "confidence": float(confidence),
            "predicted_label": label
        }
        logging.info(f"Face manipulation detection result: {result}")
        return result