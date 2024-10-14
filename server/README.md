# Credify Server

<div align="center">

![Credify Logo](https://socialify.git.ci/abhisheksharm-3/credify/image?font=Source%20Code%20Pro&language=1&name=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Dark)

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python 3.9.18](https://img.shields.io/badge/Python-3.9.18-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/downloads/release/python-3100/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Hugging Face Spaces](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue?style=for-the-badge)](https://huggingface.co/spaces/abhisheksan/credify)

</div>

## 📖 About

This is the server-side application for Credify, built with FastAPI. It provides robust APIs for media tampering detection and unique fingerprint generation, supporting the core functionality of the Credify platform.

## 🚀 Features

- Media tampering detection using advanced algorithms
- Unique fingerprint generation for digital content
- RESTful API design with FastAPI
- Docker support for easy deployment and scaling
- Integration with machine learning models for content analysis

## 🛠️ Prerequisites

- Python 3.9.18
- Pip
- Docker
- FFmpeg

## 🏁 Getting Started

1. **Clone the repository and navigate to the server directory**
   ```bash
   git clone https://github.com/abhisheksharm-3/credify.git
   cd credify/server
   ```

2. **Set up a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download models**
   - Download the models from [this Google Drive link](https://drive.google.com/drive/folders/13ekurrSgQo6d99PCv708vQVInfWpKsno?usp=sharing)
   - Place them in a folder named `models` within the `server` directory

5. **Install FFmpeg**
   - On Windows: `winget install ffmpeg`
   - Add the FFmpeg bin path to System Environment Variables
   - To find the path, run: `where ffmpeg` in CMD

6. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in the necessary environment variables

7. **Run the development server**
   ```bash
   uvicorn app.main:app --reload
   ```

8. **Access the API documentation**
   Open your browser and navigate to `http://localhost:8000/docs`

## 📁 Project Structure

```
server/
├── app/
│   ├── api/            # API routes
│   ├── core/           # Core functionality and config
│   ├── models/         # Data models and schemas
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── main.py         # FastAPI application initialization
├── models/             # ML models (to be downloaded separately)
├── Dockerfile          # Docker configuration
└── requirements.txt    # Python dependencies
```

## 🧰 Available Scripts

- `uvicorn app.main:app --reload`: Starts the development server
- `docker build -t credify-server .`: Builds the Docker image
- `docker run -p 7860:7860 credify-backend`: Runs the Docker container

## 🐳 Docker Deployment

The application is configured for Docker deployment with the following specifications:
- App Port: 7860
- SDK: Docker

Build and run the Docker container as described in the Available Scripts section.

## 🛠️ Troubleshooting

If you encounter a path error when re-uploading the same image or audio, ensure that FFmpeg is properly installed and configured on your system as described in the installation steps.

## 🤝 Contributing

Please refer to the main project README for contribution guidelines.

---

<div align="center">

For more information about the Credify project, please refer to the [main README](../README.md).

</div>