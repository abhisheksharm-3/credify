import fetch from 'node-fetch';
import { ForgeryDetectionResultType, VerificationResultType } from '@/lib/types';
import { ExternalServiceError } from '@/lib/errors';
import logger from '@/lib/logger';
import path from 'path';

const VERIFICATION_SERVICE_BASE_URL = process.env.VERIFICATION_SERVICE_BASE_URL;

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.jpe', '.jif', '.jfif', '.jfi', // JPEG
  '.png', // PNG
  '.gif', // GIF
  '.webp', // WebP
  '.tiff', '.tif', // TIFF
  '.psd', // Photoshop
  '.raw', '.arw', '.cr2', '.nrw', '.k25', // RAW
  '.bmp', '.dib', // BMP
  '.heif', '.heic', // HEIF
  '.ind', '.indd', '.indt', // Adobe InDesign
  '.jp2', '.j2k', '.jpf', '.jpx', '.jpm', '.mj2', // JPEG 2000
  '.svg', '.svgz', // SVG
  '.ai', '.eps', // Adobe Illustrator
  '.ico' // Icon
]);

const VIDEO_EXTENSIONS = new Set([
  '.mp4', '.m4v', '.m4p', // MP4
  '.avi', // AVI
  '.mov', '.qt', // QuickTime
  '.wmv', // Windows Media Video
  '.flv', '.f4v', // Flash Video
  '.webm', // WebM
  '.mpg', '.mp2', '.mpeg', '.mpe', '.mpv', // MPEG
  '.ogg', '.ogv', // Ogg
  '.3gp', '.3g2', // 3GPP
  '.mkv', // Matroska
  '.asf', // Advanced Systems Format
  '.rm', '.rmvb', // RealMedia
  '.vob', // DVD Video Object
  '.ts', '.mts', // MPEG Transport Stream
  '.m2ts' // Blu-ray BDAV
]);
export async function verifyContent(contentUrl: string, endpoint: string): Promise<VerificationResultType> {
  logger.info(`[verifyContent] Verifying content at URL: ${contentUrl}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${VERIFICATION_SERVICE_BASE_URL}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({ url: contentUrl }),
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[verifyContent] Verification service error: ${errorText}`);
      throw new ExternalServiceError(`Verification service error: ${errorText}`);
    }

    const apiResponse = await response.json() as { message: string; result: VerificationResultType };
    logger.info(`[verifyContent] Content verified successfully`);
    return apiResponse.result;
  } catch (error) {
    logger.error(`[verifyContent] Error during content verification: ${error}`);
    throw error;
  }
}
export async function detectForgery(filename: string, contentUrl: string): Promise<ForgeryDetectionResultType> {
  logger.info(`Detecting forgery for file: ${filename}`);
  const fileExtension = path.extname(filename).toLowerCase();

  const isImage = IMAGE_EXTENSIONS.has(fileExtension);
  const isVideo = VIDEO_EXTENSIONS.has(fileExtension);

  if (!isImage && !isVideo) {
    return {
      status: 'error',
      contentType: 'unknown',
      isManipulated: false,
      manipulationProbability: 0,
      detectionMethods: {},
      message: `Unsupported file type: ${fileExtension}`
    };
  }

  try {
    const response = await fetch(`${VERIFICATION_SERVICE_BASE_URL}/detect_forgery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_url: contentUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ExternalServiceError(`Verification service error: ${errorText}`);
    }

    const apiResponse = await response.json();
    return isImage ? processImageForgeryResult(apiResponse) : processVideoForgeryResult(apiResponse);
  } catch (error) {
    logger.error('Error in forgery detection:', error);
    return {
      status: 'error',
      contentType: isImage ? 'image' : 'video',
      isManipulated: false,
      manipulationProbability: 0,
      detectionMethods: {},
      message: 'An error occurred during forgery detection'
    };
  }
}

function processImageForgeryResult(apiResponse: any): ForgeryDetectionResultType {
  const imageManipulation = apiResponse.image_manipulation;
  const ganDetection = apiResponse.gan_detection;
  const faceManipulation = apiResponse.face_manipulation;
  const isManipulated = imageManipulation.is_manipulated || ganDetection.is_gan || faceManipulation?.is_deepfake || false;
  const manipulationProbability = Math.max(
    parseFloat(imageManipulation.confidence) || 0,
    ganDetection.fake_confidence,
    faceManipulation?.confidence
  );

  return {
    status: 'completed',
    contentType: 'image',
    isManipulated,
    manipulationProbability,
    detectionMethods: {
      imageManipulation: imageManipulation.is_manipulated,
      ganGenerated: ganDetection.is_gan,
      faceManipulation: faceManipulation?.is_deepfake
    }
  };
}

function processVideoForgeryResult(apiResponse: any): ForgeryDetectionResultType {
  const imageManipulation = apiResponse.image_manipulation;
  const faceManipulation = apiResponse.face_manipulation;
  const ganDetection = apiResponse.gan_detection;
  const audioDeepfake = apiResponse.audio_deepfake;

  const isManipulated = imageManipulation.collective_detection || faceManipulation?.collective_detection || ganDetection.collective_detection || audioDeepfake || false;
  const manipulationProbability = Math.max(
    imageManipulation.collective_confidence,
    faceManipulation?.collective_confidence,
    ganDetection.collective_confidence
  );

  return {
    status: 'completed',
    contentType: 'video',
    isManipulated,
    manipulationProbability,
    detectionMethods: {
      imageManipulation: imageManipulation.collective_detection,
      faceManipulation: faceManipulation?.collective_detection,
      ganGenerated: ganDetection.collective_detection,
      audioDeepfake: audioDeepfake
    }
  };
}