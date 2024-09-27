from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from app.services import video_service, image_service, antispoof_service
from app.services.antispoof_service import antispoof_service
from app.services.image_service import compare_images
import logging

router = APIRouter()

class ContentRequest(BaseModel):
    url: str

class CompareRequest(BaseModel):
    url1: str
    url2: str

@router.get("/health")
@router.head("/health")
async def health_check():
    """
    Health check endpoint that responds to both GET and HEAD requests.
    """
    return Response(content="OK", media_type="text/plain")

@router.post("/fingerprint")
async def create_fingerprint(request: ContentRequest):
    try:
        result = await video_service.fingerprint_video(request.url)
        return {"message": "Fingerprint processing completed", "result": result}
    except Exception as e:
        logging.error(f"Error in fingerprint processing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in fingerprint processing: {str(e)}")

@router.post("/verify_video_only")
async def verify_video_only(request: ContentRequest):
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
    try:
        result = await video_service.compare_videos(request.url1, request.url2)
        return {"message": "Video comparison completed", "result": result}
    except Exception as e:
        logging.error(f"Error in video comparison: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in video comparison: {str(e)}")

@router.post("/verify_image")
async def verify_image_route(request: ContentRequest):
    try:
        result = await image_service.verify_image(request.url)
        return {"message": "Image verification completed", "result": result}
    except Exception as e:
        logging.error(f"Error in image verification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in image verification: {str(e)}")

@router.post("/compare_images")
async def compare_images_route(request: CompareRequest):
    try:
        result = await compare_images(request.url1, request.url2)
        return {"message": "Image comparison completed", "result": result}
    except Exception as e:
        logging.error(f"Error in image comparison: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in image comparison: {str(e)}")