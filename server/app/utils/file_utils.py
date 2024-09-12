import aiohttp
import uuid 
import logging
from urllib.parse import urlparse
from app.core.firebase_config import firebase_bucket
import io

async def download_file(url: str) -> str:
    parsed_url = urlparse(url)
    file_extension = parsed_url.path.split('.')[-1]
    
    if not file_extension:
        file_extension = 'tmp'

    filename = f"{uuid.uuid4()}.{file_extension}"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    raise Exception(f"Failed to download file: HTTP {response.status}")
                
                content = await response.read()
                blob = firebase_bucket.blob(filename)
                blob.upload_from_string(content, content_type=response.headers.get('content-type'))

        logging.info(f"File downloaded and saved to Firebase: {filename}")
        return filename
    except Exception as e:
        logging.error(f"Error downloading file: {str(e)}")
        raise

async def remove_temp_file(filename: str):
    try:
        blob = firebase_bucket.blob(filename)
        blob.delete()
        logging.info(f"Temporary file deleted from Firebase: {filename}")
    except Exception as e:
        logging.error(f"Error deleting temporary file from Firebase: {str(e)}")

def get_file_content(filename: str) -> bytes:
    try:
        blob = firebase_bucket.blob(filename)
        return blob.download_as_bytes()
    except Exception as e:
        logging.error(f"Error getting file content from Firebase: {str(e)}")
        raise

def get_file_stream(filename: str) -> io.BytesIO:
    try:
        content = get_file_content(filename)
        return io.BytesIO(content)
    except Exception as e:
        logging.error(f"Error getting file stream from Firebase: {str(e)}")
        raise