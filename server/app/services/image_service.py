from app.utils.image_utils import process_image, compare_images as compare_images_util
from fastapi import HTTPException
import logging
from app.utils.file_utils import download_file, remove_temp_file

async def verify_image(image_url: str):
    firebase_filename = None
    try:
        firebase_filename = await download_file(image_url)
        
        image_hash = process_image(firebase_filename)
        return {"image_hash": image_hash}
    except Exception as e:
        logging.error(f"Error verifying image: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error verifying image: {str(e)}")
    finally:
        if firebase_filename:
            await remove_temp_file(firebase_filename)

async def compare_images(image_url1: str, image_url2: str):
    firebase_filename1 = None
    firebase_filename2 = None
    try:
        # Download the files from their URLs and store them in Firebase
        firebase_filename1 = await download_file(image_url1)
        firebase_filename2 = await download_file(image_url2)
        
        # Compare the images using the utility function
        comparison_result = compare_images_util(firebase_filename1, firebase_filename2)
        
        # Return the comparison result
        return comparison_result
    except Exception as e:
        logging.error(f"Error comparing images: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error comparing images: {str(e)}")
    finally:
        # Remove temporary files from Firebase after processing
        if firebase_filename1:
            await remove_temp_file(firebase_filename1)
        if firebase_filename2:
            await remove_temp_file(firebase_filename2)
