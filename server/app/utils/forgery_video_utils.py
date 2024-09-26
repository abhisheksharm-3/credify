import cv2
import numpy as np
from moviepy.editor import VideoFileClip
from PIL import Image
import io
from app.utils.file_utils import get_file_content, upload_file_to_firebase, remove_temp_file
import subprocess
import tempfile
import os
import logging

async def extract_audio(firebase_filename):
    try:
        video_content = get_file_content(firebase_filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
            temp_video.write(video_content)
            temp_video_path = temp_video.name

        with VideoFileClip(temp_video_path) as video:
            if video.audio is not None:
                audio_filename = f"{firebase_filename}_audio.wav"
                with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
                    video.audio.write_audiofile(temp_audio.name, logger=None)
                    temp_audio_path = temp_audio.name

                with open(temp_audio_path, 'rb') as audio_file:
                    audio_content = audio_file.read()
                
                await upload_file_to_firebase(audio_content, audio_filename)
                os.remove(temp_audio_path)
                os.remove(temp_video_path)
                return audio_filename
        
        os.remove(temp_video_path)
    except Exception as e:
        logging.error(f"Error extracting audio: {str(e)}")
    return None

async def extract_frames(firebase_filename, max_frames=10):
    frames = []
    video_content = get_file_content(firebase_filename)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
        temp_video.write(video_content)
        temp_video_path = temp_video.name

    try:
        with VideoFileClip(temp_video_path) as video:
            duration = video.duration
            frame_interval = duration / max_frames

            for i in range(max_frames):
                t = i * frame_interval
                frame = video.get_frame(t)
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame_image = Image.fromarray(frame_rgb)
                
                frame_filename = f"{firebase_filename}_frame_{i}.jpg"
                frame_byte_arr = io.BytesIO()
                frame_image.save(frame_byte_arr, format='JPEG')
                frame_byte_arr = frame_byte_arr.getvalue()
                
                await upload_file_to_firebase(frame_byte_arr, frame_filename)
                frames.append(frame_filename)

    finally:
        os.remove(temp_video_path)

    return frames

async def compress_and_process_video(firebase_filename, target_size_mb=50, max_duration=60):
    video_content = get_file_content(firebase_filename)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
        temp_video.write(video_content)
        input_path = temp_video.name

    output_filename = f"{firebase_filename}_compressed.mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_output:
        output_path = temp_output.name

    try:
        probe_cmd = ['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                     '-show_entries', 'stream=width,height,duration,bit_rate',
                     '-of', 'json', input_path]

        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        video_info = eval(result.stdout)['streams'][0]

        width = video_info.get('width', 1280)
        height = video_info.get('height', 720)
        duration = float(video_info.get('duration', '0'))
        original_bitrate = int(video_info.get('bit_rate', '0'))

        if duration <= 0:
            logging.warning(f"Invalid video duration ({duration}). Using 1 second as default.")
            duration = 1

        duration = min(duration, max_duration)

        target_size_bits = target_size_mb * 8 * 1024 * 1024
        target_bitrate = int(target_size_bits / duration)

        if width > height:
            new_width = min(width, 1280)
            new_height = int((new_width / width) * height)
        else:
            new_height = min(height, 720)
            new_width = int((new_height / height) * width)

        new_width = new_width - (new_width % 2)
        new_height = new_height - (new_height % 2)

        cmd = [
            'ffmpeg', '-y', '-i', input_path,
            '-c:v', 'libx264', '-preset', 'faster',
            '-crf', '23',
            '-b:v', f'{target_bitrate}',
            '-maxrate', f'{int(1.5*target_bitrate)}',
            '-bufsize', f'{2*target_bitrate}',
            '-vf', f'scale={new_width}:{new_height}',
            '-t', str(duration),
            '-c:a', 'aac', '-b:a', '128k',
            output_path
        ]

        subprocess.run(cmd, check=True, capture_output=True)

        with open(output_path, 'rb') as compressed_video:
            compressed_content = compressed_video.read()
        
        await upload_file_to_firebase(compressed_content, output_filename)

    finally:
        os.remove(input_path)
        os.remove(output_path)

    return output_filename