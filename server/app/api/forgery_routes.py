from fastapi import APIRouter, HTTPException
from app.services.image_manipulation_service import ImageManipulationService
from app.services.face_manipulation_service import FaceManipulationService
from app.services.audio_deepfake_service import AudioDeepfakeService
from app.services.gan_detection_service import GANDetectionService
from app.utils.file_utils import download_file, remove_temp_file, get_file_content
from app.utils.forgery_image_utils import detect_face
from app.utils.forgery_video_utils import extract_audio, extract_frames, compress_and_process_video, detect_speech # Adjust the import path if necessary
from app.services.deepfake_video_detection import DeepfakeVideoDetectionService
import os
import numpy as np
import logging
import traceback
from pydantic import BaseModel

router = APIRouter()

class DetectForgeryRequest(BaseModel):
    file_url: str

# Initialize services
image_manipulation_service = ImageManipulationService()
face_manipulation_service = FaceManipulationService()
audio_deepfake_service = AudioDeepfakeService()
gan_detection_service = GANDetectionService()
deepfake_video_detection_service = DeepfakeVideoDetectionService()


def parse_confidence(value):
    if isinstance(value, str):
        return float(value.rstrip('%')) / 100
    return float(value)

def get_file_extension(url: str) -> str:
    _, ext = os.path.splitext(url)
    return ext.lstrip('.').lower()

@router.post("/detect_forgery")
async def detect_forgery(request: DetectForgeryRequest):
    file_url = request.file_url
    logging.info(f"Received forgery detection request for file: {file_url}")
    
    firebase_filename = None
    
    try:
        file_extension = get_file_extension(file_url)
        logging.info(f"Detected file extension: {file_extension}")
        
        firebase_filename = await download_file(file_url)
        logging.info(f"File downloaded and saved as: {firebase_filename}")
        
        if file_extension in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'gif', 'tiff', 'webp']:
            logging.info(f"Processing image file: {firebase_filename}")
            return await process_image(firebase_filename)
        elif file_extension in ['mp4', 'avi', 'mov', 'flv', 'wmv']:
            logging.info(f"Processing video file: {firebase_filename}")
            return await process_video(firebase_filename)
        else:
            logging.error(f"Unsupported file type: {file_extension} (URL: {file_url})")
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_extension}")
    
    except Exception as e:
        logging.error(f"Error processing file: {e}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="An error occurred while processing the file.")
    
    finally:
        if firebase_filename:
            logging.info(f"Removing temporary file: {firebase_filename}")
            await remove_temp_file(firebase_filename)

async def process_image(firebase_filename: str):
    logging.info(f"Starting image processing for: {firebase_filename}")
    image_content = get_file_content(firebase_filename)
    has_face = detect_face(image_content)
    logging.info(f"Face detection result for {firebase_filename}: {'Face detected' if has_face else 'No face detected'}")
    results = {
        "image_manipulation": image_manipulation_service.detect_manipulation(firebase_filename),
        "gan_detection": gan_detection_service.detect_gan(firebase_filename)
    }
    logging.info(f"Image manipulation detection result: {results['image_manipulation']}")
    logging.info(f"GAN detection result: {results['gan_detection']}")
    if has_face:
        results["face_manipulation"] = face_manipulation_service.detect_manipulation(firebase_filename)
        logging.info(f"Face manipulation detection result: {results['face_manipulation']}")
    else:
        results["face_manipulation"] = {
            "is_manipulated": False,
            "confidence": "0%"
        }
        logging.info("Face manipulation detection skipped (no face detected)")
    logging.info(f"Image processing completed for: {firebase_filename}")
    return results

def convert_to_python_types(obj):
    if isinstance(obj, np.generic):
        return obj.item()
    elif isinstance(obj, (list, tuple)):
        return [convert_to_python_types(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_to_python_types(value) for key, value in obj.items()}
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj

async def process_video(firebase_filename: str):
    logging.info(f"Starting video processing for: {firebase_filename}")
    try:
        compressed_video_filename = await compress_and_process_video(firebase_filename)
        logging.info(f"Video compressed: {compressed_video_filename}")
        
        audio_filename = await extract_audio(compressed_video_filename)
        is_audio_deepfake = False
        
        if audio_filename:
            logging.info(f"Audio extracted successfully: {audio_filename}")
            audio_content = get_file_content(audio_filename)
            if detect_speech(audio_content):
                logging.info("Speech detected in the audio")
                # Audio deepfake detection logic here if needed
            else:
                logging.info("No speech detected in the audio")
            await remove_temp_file(audio_filename)
            logging.info(f"Temporary audio file removed: {audio_filename}")
        else:
            logging.info("No audio detected or extracted from the video")

        results = {"is_audio_deepfake": is_audio_deepfake}

        frames = await extract_frames(compressed_video_filename)
        logging.info(f"Frames extracted: {len(frames)} frames")

        results.update({
            "image_manipulation": {
                "collective_detection": False,
                "collective_confidence": 0.0
            },
            "face_manipulation": {
                "collective_detection": False,
                "collective_confidence": 0.0
            },
            "gan_detection": {
                "collective_detection": False,
                "collective_confidence": 0.0
            }
        })

        face_frames = []
        img_manip_detections = []
        img_manip_confidences = []
        gan_detections = []
        gan_confidences = []

        for frame in frames:
            frame_content = get_file_content(frame)
            has_face = detect_face(frame_content)
            if has_face:
                face_frames.append(frame)
            
            img_manip_result = image_manipulation_service.detect_manipulation(frame)
            gan_result = gan_detection_service.detect_gan(frame)
            
            img_manip_detections.append(img_manip_result.get("is_manipulated", False))
            img_manip_confidences.append(parse_confidence(img_manip_result.get("confidence", "0%")))
            gan_detections.append(gan_result.get("is_gan", False))
            gan_confidences.append(parse_confidence(gan_result.get("confidence", "0%")))

        # Aggregate results for image manipulation and GAN detection
        results["image_manipulation"]["collective_detection"] = any(img_manip_detections)
        results["image_manipulation"]["collective_confidence"] = sum(img_manip_confidences) / len(img_manip_confidences) if img_manip_confidences else 0.0
        
        results["gan_detection"]["collective_detection"] = any(gan_detections)
        results["gan_detection"]["collective_confidence"] = sum(gan_confidences) / len(gan_confidences) if gan_confidences else 0.0

        # Perform deepfake detection if faces were detected
        if face_frames:
            deepfake_result = deepfake_video_detection_service.detect_deepfake(face_frames)
            deepfake_result = convert_to_python_types(deepfake_result)
            results["face_manipulation"] = {
                "collective_detection": bool(deepfake_result["is_deepfake"]),
                "collective_confidence": deepfake_result['confidence']
            }
        
        logging.info(f"Aggregated results: {results}")

        await remove_temp_file(compressed_video_filename)
        for frame in frames:
            await remove_temp_file(frame)
        logging.info(f"Temporary files removed")
        logging.info(f"Video processing completed for: {firebase_filename}")
        
        return results
    except Exception as e:
        logging.error(f"Error processing video: {e}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the video: {str(e)}")