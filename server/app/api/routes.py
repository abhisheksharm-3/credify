from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from app.services import video_service, image_service, antispoof_service
from app.services.antispoof_service import antispoof_service
from app.services.hash_comparison_service import compare_hash_with_array
from app.services.image_service import compare_images
from typing import List
import logging
import os

router = APIRouter()

class ContentRequest(BaseModel):
    url: str

class CompareRequest(BaseModel):
    url1: str
    url2: str
    
class CompareHashesRequest(BaseModel):
    hash_to_compare: str
    hash_array: List[str]
    file_type: str
    
SUPPORTED_VIDEO_FORMATS = ['mp4', 'avi', 'mov', 'flv', 'wmv']
SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp']

def is_supported_video_format(url: str) -> bool:
    file_extension = os.path.splitext(url)[1][1:].lower()
    return file_extension in SUPPORTED_VIDEO_FORMATS

def is_supported_image_format(url: str) -> bool:
    file_extension = os.path.splitext(url)[1][1:].lower()
    return file_extension in SUPPORTED_IMAGE_FORMATS

@router.get("/health")
@router.head("/health")
async def health_check():
    """
    Health check endpoint that responds to both GET and HEAD requests.
    """
    return Response(content="OK", media_type="text/plain")

@router.post("/fingerprint")
async def create_fingerprint(request: ContentRequest):
    if not is_supported_video_format(request.url):
        raise HTTPException(status_code=400, detail="Video format not supported")
    try:
        result = await video_service.fingerprint_video(request.url)
        return {"message": "Fingerprint processing completed", "result": result}
    except Exception as e:
        logging.error(f"Error in fingerprint processing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in fingerprint processing: {str(e)}")

@router.post("/verify_video_only")
async def verify_video_only(request: ContentRequest):
    if not is_supported_video_format(request.url):
        raise HTTPException(status_code=400, detail="Video format not supported")
    try:
        result = await video_service.fingerprint_video(request.url)
        return {"message": "Video verification completed", "result": result}
    except Exception as e:
        logging.error(f"Error in video verification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in video verification: {str(e)}")

@router.post("/verify_liveness")
async def verify_liveness(request: ContentRequest):
    try:
        result = await antispoof_service.verify_liveness(request.url)
        return {"message": "Liveness verification completed", "result": result}
    except Exception as e:
        logging.error(f"Error in liveness verification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in liveness verification: {str(e)}")

@router.post("/compare_videos")
async def compare_videos_route(request: CompareRequest):
    if not is_supported_video_format(request.url1) or not is_supported_video_format(request.url2):
        raise HTTPException(status_code=400, detail="Video format not supported")
    try:
        result = await video_service.compare_videos(request.url1, request.url2)
        return {"message": "Video comparison completed", "result": result}
    except Exception as e:
        logging.error(f"Error in video comparison: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in video comparison: {str(e)}")

@router.post("/verify_image")
async def verify_image_route(request: ContentRequest):
    if not is_supported_image_format(request.url):
        raise HTTPException(status_code=400, detail="Image format not supported")
    try:
        result = await image_service.verify_image(request.url)
        return {"message": "Image verification completed", "result": result}
    except Exception as e:
        logging.error(f"Error in image verification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in image verification: {str(e)}")

@router.post("/compare_images")
async def compare_images_route(request: CompareRequest):
    if not is_supported_image_format(request.url1) or not is_supported_image_format(request.url2):
        raise HTTPException(status_code=400, detail="Image format not supported")
    try:
        result = await compare_images(request.url1, request.url2)
        return {"message": "Image comparison completed", "result": result}
    except Exception as e:
        logging.error(f"Error in image comparison: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in image comparison: {str(e)}")
    
   
@router.post("/compare_hashes")
async def compare_hashes_route(request: CompareHashesRequest):
    try:
        comparison_results = compare_hash_with_array(request.hash_to_compare, request.hash_array, request.file_type)
        return {
            "message": comparison_results["message"],
            "results": comparison_results["results"],
            "matching_hash": comparison_results["matching_hash"]
        }
    except Exception as e:
        logging.error(f"Error in hash comparison: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in hash comparison: {str(e)}")