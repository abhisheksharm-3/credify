FROM python:3.9.18

WORKDIR /code
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    ffmpeg
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
RUN mkdir -m 777 /tmp/NUMBA_CACHE_DIR
ENV NUMBA_CACHE_DIR=/tmp/NUMBA_CACHE_DIR/

COPY . /code/

# Expose the secret FIREBASE_KEY_BASE64 at buildtime and save it as a file
RUN --mount=type=secret,id=FIREBASE_KEY_BASE64,mode=0400,required=true \
    cat /run/secrets/FIREBASE_KEY_BASE64 | base64 -d > /code/firebase_key.json && \
    chmod 0400 /code/firebase_key.json

# Set the Google Application Credentials environment variable
ENV GOOGLE_APPLICATION_CREDENTIALS="/code/firebase_key.json"

# The FIREBASE_STORAGE_BUCKET will be available at runtime as an environment variable

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]