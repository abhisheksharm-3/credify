import numpy as np
import imagehash
from PIL import Image
import logging
import io
import av

def compute_video_hash(features):
    logging.info("Computing video hash.")
    return imagehash.phash(Image.fromarray(np.mean(features, axis=0).reshape(8, 8)))

def compute_frame_hashes(video_content):
    logging.info("Computing frame hashes")
    
    try:
        with av.open(io.BytesIO(video_content)) as container:
            video_stream = next(s for s in container.streams if s.type == 'video')
            frame_hashes = []
            
            for frame in container.decode(video=0):
                img = frame.to_image().convert('L')  # Convert to grayscale
                img_hash = imagehash.average_hash(img)
                frame_hashes.append(str(img_hash))
        
    except Exception as e:
        logging.error(f"Error computing frame hashes: {str(e)}")
        raise
    
    logging.info("Finished computing frame hashes.")
    return frame_hashes