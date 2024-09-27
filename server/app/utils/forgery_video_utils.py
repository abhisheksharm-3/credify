import av
import numpy as np
from PIL import Image
import io
from app.utils.file_utils import get_file_content, upload_file_to_firebase, remove_temp_file
import logging
import uuid
from typing import List, Tuple

async def extract_audio(firebase_filename: str) -> str:
    try:
        video_content = get_file_content(firebase_filename)
        input_container = av.open(io.BytesIO(video_content))
        
        audio_stream = next((s for s in input_container.streams if s.type == 'audio'), None)
        if audio_stream is None:
            logging.warning(f"No audio stream found in {firebase_filename}")
            return None

        output_container = av.open(io.BytesIO(), mode='w', format='wav')
        output_stream = output_container.add_stream('pcm_s16le', rate=audio_stream.rate)

        for frame in input_container.decode(audio_stream):
            for packet in output_stream.encode(frame):
                output_container.mux(packet)

        # Flush the stream
        for packet in output_stream.encode(None):
            output_container.mux(packet)

        output_container.close()
        
        audio_content = output_container.data.getvalue()
        audio_filename = f"{firebase_filename}_audio.wav"
        await upload_file_to_firebase(audio_content, audio_filename)
        
        return audio_filename
    except Exception as e:
        logging.error(f"Error extracting audio: {str(e)}")
    return None

async def extract_frames(firebase_filename: str, max_frames: int = 10) -> List[str]:
    frames = []
    video_content = get_file_content(firebase_filename)
    
    try:
        with av.open(io.BytesIO(video_content)) as container:
            video_stream = container.streams.video[0]
            duration = float(video_stream.duration * video_stream.time_base)
            frame_interval = duration / max_frames

            for i in range(max_frames):
                container.seek(int(i * frame_interval * av.time_base))
                for frame in container.decode(video=0):
                    frame_rgb = frame.to_rgb().to_ndarray()
                    frame_image = Image.fromarray(frame_rgb)
                    
                    frame_filename = f"{firebase_filename}_frame_{i}.jpg"
                    frame_byte_arr = io.BytesIO()
                    frame_image.save(frame_byte_arr, format='JPEG')
                    frame_byte_arr = frame_byte_arr.getvalue()
                    
                    await upload_file_to_firebase(frame_byte_arr, frame_filename)
                    frames.append(frame_filename)
                    break  # Only take the first frame after seeking

    except Exception as e:
        logging.error(f"Error extracting frames: {str(e)}")

    return frames

import av
import numpy as np
from PIL import Image
import io
from app.utils.file_utils import get_file_content, upload_file_to_firebase, remove_temp_file
import logging
import uuid
from typing import List, Tuple

# ... (previous functions remain unchanged)

async def compress_and_process_video(firebase_filename: str, target_size_mb: int = 50, max_duration: int = 60) -> str:
    video_content = get_file_content(firebase_filename)
    
    try:
        input_container = av.open(io.BytesIO(video_content))
        video_stream = input_container.streams.video[0]
        audio_stream = next((s for s in input_container.streams if s.type == 'audio'), None)

        # Get video information
        width = video_stream.width
        height = video_stream.height
        duration = float(video_stream.duration * video_stream.time_base)
        duration = min(duration, max_duration)
        frame_rate = video_stream.average_rate

        # Calculate target bitrate
        target_size_bits = target_size_mb * 8 * 1024 * 1024
        target_bitrate = int(target_size_bits / duration)

        # Adjust dimensions
        if width > height:
            new_width = min(width, 1280)
            new_height = int((new_width / width) * height)
        else:
            new_height = min(height, 720)
            new_width = int((new_height / height) * width)

        new_width = new_width - (new_width % 2)
        new_height = new_height - (new_height % 2)

        output_buffer = io.BytesIO()
        output_container = av.open(output_buffer, mode='w', format='mp4')
        output_video_stream = output_container.add_stream('libx264', rate=frame_rate)
        output_video_stream.width = new_width
        output_video_stream.height = new_height
        output_video_stream.pix_fmt = 'yuv420p'
        output_video_stream.bit_rate = target_bitrate

        if audio_stream:
            output_audio_stream = output_container.add_stream('aac', rate=audio_stream.rate)
            output_audio_stream.bit_rate = 128000  # 128k bitrate for audio

        for frame in input_container.decode(video=0):
            if frame.time > duration:
                break
            new_frame = frame.reformat(width=new_width, height=new_height, format='yuv420p')
            for packet in output_video_stream.encode(new_frame):
                output_container.mux(packet)

        if audio_stream:
            for frame in input_container.decode(audio=0):
                if frame.time > duration:
                    break
                for packet in output_audio_stream.encode(frame):
                    output_container.mux(packet)

        # Flush streams
        for packet in output_video_stream.encode(None):
            output_container.mux(packet)
        if audio_stream:
            for packet in output_audio_stream.encode(None):
                output_container.mux(packet)

        # Close the output container
        output_container.close()
        
        # Get the compressed content
        compressed_content = output_buffer.getvalue()
        output_filename = f"{firebase_filename}_compressed.mp4"
        await upload_file_to_firebase(compressed_content, output_filename)

        return output_filename

    except Exception as e:
        logging.error(f"Error compressing and processing video: {str(e)}")
        raise