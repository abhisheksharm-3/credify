from fastapi import APIRouter, HTTPException
from app.services.image_manipulation_service import ImageManipulationService
from app.services.face_manipulation_service import FaceManipulationService
from app.services.audio_deepfake_service import AudioDeepfakeService
from app.services.gan_detection_service import GANDetectionService
from app.utils.file_utils import download_file, remove_temp_file, get_file_content
from app.utils.forgery_image_utils import detect_face
from app.utils.forgery_video_utils import extract_audio, extract_frames, compress_and_process_video, detect_speech # Adjust the import path if necessary

import os
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
        results["face_manipulation"] = None
        logging.info("Face manipulation detection skipped (no face detected)")
    logging.info(f"Image processing completed for: {firebase_filename}")
    return results

async def process_video(firebase_filename: str):
    logging.info(f"Starting video processing for: {firebase_filename}")
    try:
        compressed_video_filename = await compress_and_process_video(firebase_filename)
        logging.info(f"Video compressed: {compressed_video_filename}")
        
        audio_filename = await extract_audio(compressed_video_filename)
        if audio_filename:
            logging.info(f"Audio extracted successfully: {audio_filename}")
            audio_content = get_file_content(audio_filename)
            if detect_speech(audio_content):
                logging.info("Speech detected in the audio")
                results = {"audio_deepfake": audio_deepfake_service.detect_deepfake(audio_filename)}
            else:
                logging.info("No speech detected in the audio")
                results = {"audio_deepfake": {"prediction": "No speech detected", "confidence": 1.0, "raw_prediction": 1.0}}
            await remove_temp_file(audio_filename)
            logging.info(f"Temporary audio file removed: {audio_filename}")
        else:
            logging.warning("No audio detected or extracted from the video")
            results = {"audio_deepfake": {"prediction": "No audio", "confidence": 1.0, "raw_prediction": 1.0}}

        frames = await extract_frames(compressed_video_filename)
        logging.info(f"Frames extracted: {len(frames)} frames")

        results.update({
            "image_manipulation": [],
            "face_manipulation": [],
            "gan_detection": []
        })

        face_frames = []
        for i, frame in enumerate(frames):
            frame_filename = frame  # Assuming extract_frames now returns a list of filenames
            logging.info(f"Processing frame: {frame_filename}")
            frame_content = get_file_content(frame_filename)
            has_face = detect_face(frame_content)
            logging.info(f"Face detection result for {frame_filename}: {'Face detected' if has_face else 'No face detected'}")

            results["image_manipulation"].append(image_manipulation_service.detect_manipulation(frame_filename))
            results["gan_detection"].append(gan_detection_service.detect_gan(frame_filename))

            if has_face:
                face_frames.append(frame_filename)
                results["face_manipulation"].append(face_manipulation_service.detect_manipulation(frame_filename))
            else:
                results["face_manipulation"].append(None)
                logging.info(f"Face manipulation detection skipped for {frame_filename} (no face detected)")

            await remove_temp_file(frame_filename)
            logging.info(f"Temporary frame file removed: {frame_filename}")

        # Aggregate results
        for key in results:
            if key != "audio_deepfake" and results[key]:
                valid_results = [r for r in results[key] if r is not None]
                results[key] = {
                    "collective_detection": any(r.get("is_manipulated", False) if isinstance(r, dict) else r for r in valid_results),
                    "collective_confidence": sum(parse_confidence(r.get("confidence", 0)) if isinstance(r, dict) else 0 for r in valid_results) / len(valid_results) if valid_results else 0
                }
        logging.info(f"Aggregated results: {results}")

        await remove_temp_file(compressed_video_filename)
        logging.info(f"Temporary compressed video file removed: {compressed_video_filename}")
        logging.info(f"Video processing completed for: {firebase_filename}")
        return results
    except Exception as e:
        logging.error(f"Error processing video: {e}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the video: {str(e)}")