import av
import numpy as np
from PIL import Image
import io
import traceback
from app.utils.file_utils import get_file_content, upload_file_to_firebase, remove_temp_file
import logging
import uuid
from typing import List, Tuple
import librosa

async def extract_audio(firebase_filename: str) -> str:
    try:
        video_content = get_file_content(firebase_filename)
        input_container = av.open(io.BytesIO(video_content))
        
        audio_stream = next((s for s in input_container.streams if s.type == 'audio'), None)
        if audio_stream is None:
            logging.warning(f"No audio stream found in {firebase_filename}")
            return None

        logging.info(f"Audio stream found: {audio_stream}")
        logging.info(f"Audio codec: {audio_stream.codec_context.name}")
        logging.info(f"Audio sample rate: {audio_stream.rate}")
        logging.info(f"Audio bit rate: {audio_stream.bit_rate}")
        
        output_buffer = io.BytesIO()
        output_container = av.open(output_buffer, mode='w', format='wav')
        output_stream = output_container.add_stream('pcm_s16le', rate=audio_stream.rate)

        frame_count = 0
        for frame in input_container.decode(audio_stream):
            frame_count += 1
            for packet in output_stream.encode(frame):
                output_container.mux(packet)

        logging.info(f"Processed {frame_count} audio frames")

        # Flush the stream
        for packet in output_stream.encode(None):
            output_container.mux(packet)

        output_container.close()
        
        audio_content = output_buffer.getvalue()
        audio_size = len(audio_content)
        logging.info(f"Extracted audio size: {audio_size} bytes")

        if audio_size < 1024:  # Check if audio content is too small (less than 1KB)
            logging.warning(f"Extracted audio is too short for {firebase_filename}")
            return None
        
        audio_filename = f"{firebase_filename}_audio.wav"
        await upload_file_to_firebase(audio_content, audio_filename)
        
        logging.info(f"Audio extracted and uploaded: {audio_filename}")
        return audio_filename
    except Exception as e:
        logging.error(f"Error extracting audio: {str(e)}")
        logging.error(traceback.format_exc())
    return None

def detect_speech(audio_content: bytes) -> bool:
    try:
        y, sr = librosa.load(io.BytesIO(audio_content), sr=None)
        logging.info(f"Loaded audio with sample rate: {sr}, length: {len(y)}")
        
        # Calculate the root mean square energy
        rms = librosa.feature.rms(y=y)[0]
        
        # Calculate the percentage of frames with energy above a threshold
        threshold = 0.01  # Adjust this value based on your needs
        speech_frames = np.sum(rms > threshold)
        speech_percentage = speech_frames / len(rms)
        
        logging.info(f"Speech detection: {speech_percentage:.2%} of frames above threshold")
        
        # If more than 10% of frames have energy above the threshold, consider it speech
        is_speech = speech_percentage > 0.1
        logging.info(f"Speech detected: {is_speech}")
        
        return is_speech
    except Exception as e:
        logging.error(f"Error detecting speech: {str(e)}")
        logging.error(traceback.format_exc())
        return False

async def extract_frames(firebase_filename: str, max_frames: int = 20) -> List[str]:
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
            output_audio_stream.bit_rate = min(128000, audio_stream.bit_rate or 128000)  # 128k bitrate for audio, or lower if original is lower

        for packet in input_container.demux((video_stream, audio_stream) if audio_stream else (video_stream,)):
            if packet.dts is None:
                continue

            if packet.stream.type == 'video':
                for frame in packet.decode():
                    if frame.time > duration:
                        break
                    new_frame = frame.reformat(width=new_width, height=new_height, format='yuv420p')
                    for packet in output_video_stream.encode(new_frame):
                        output_container.mux(packet)
            elif packet.stream.type == 'audio' and audio_stream:
                for frame in packet.decode():
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

        logging.info(f"Compressed video uploaded to Firebase: {output_filename}")
        return output_filename

    except Exception as e:
        logging.error(f"Error compressing and processing video: {str(e)}")
        logging.error(traceback.format_exc())
        raise