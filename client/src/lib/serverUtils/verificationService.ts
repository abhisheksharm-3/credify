import fetch from 'node-fetch';
import { AppwriteUser, ForgeryDetectionResult } from '@/lib/types';
import { ExternalServiceError } from '@/lib/errors';
import logger from '@/lib/logger';
import path from 'path';
import { createAdminClient, getLoggedInUser } from '../server/appwrite';
import { Databases, ID, Query } from 'node-appwrite';

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

export async function detectForgery(filename: string, contentUrl: string, contentId: string): Promise<ForgeryDetectionResult> {
  logger.info(`Detecting forgery for file: ${filename}`);
  const fileExtension = path.extname(filename).toLowerCase();
  const userData = await getLoggedInUser() as AppwriteUser
  const userId = userData?.$id;

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
    const forgeryResult = isImage ? processImageForgeryResult(apiResponse) : processVideoForgeryResult(apiResponse);
    await storeAnalyzedContent(forgeryResult, userId, contentId)
    return forgeryResult
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
export async function storeAnalyzedContent(ForgeryDetectionResult: ForgeryDetectionResult, userId: string | undefined, contentId: string): Promise<void> {
  if (!userId) {
    return
  }
  console.log(`[storeAnalyzedContent] Storing analyzed content for userId: ${userId}, contentId: ${contentId}`);
  try {
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);

    const { documents } = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_VERIFIED_CONTENT_COLLECTION_ID!,
      [
        Query.equal('userId', userId),
        Query.equal('contentId', contentId)
      ]
    );

    if (documents.length === 0) {
      console.log(`[storeAnalyzedContent] No existing document found. Return.`);
    } else {
      console.log(`[storeAnalyzedContent] Existing document found. Updating document.`);
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_VERIFIED_CONTENT_COLLECTION_ID!,
        documents[0].$id,
        {
          isManipulated: ForgeryDetectionResult.isManipulated,
          manipulationProbability: ForgeryDetectionResult.manipulationProbability?.toString(),
          imageManipulation: ForgeryDetectionResult.detectionMethods?.imageManipulation,
          ganGenerated: ForgeryDetectionResult.detectionMethods?.ganGenerated,
          faceManipulation: ForgeryDetectionResult.detectionMethods?.faceManipulation,
          audioDeepFake: ForgeryDetectionResult.detectionMethods?.audioDeepfake
        }
      );
    }

    console.log(`[storeAnalyzedContent] Analyzed content stored successfully`);
  } catch (error) {
    console.error(`[storeAnalyzedContent] Error storing analyzed content: ${error}`);
    throw error;
  }
}
function processImageForgeryResult(apiResponse: any): ForgeryDetectionResult {
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

function processVideoForgeryResult(apiResponse: any): ForgeryDetectionResult {
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