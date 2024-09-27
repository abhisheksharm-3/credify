import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { initializeNeo4j, ensureNeo4jConnection } from '@/lib/server/neo4jhelpers';
import {
  ContentDownloadError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ExternalServiceError
} from '@/lib/errors';
import logger from '@/lib/logger';
import { rateLimit } from '@/lib/rateLimit';
import NodeCache from 'node-cache';

export const dynamic = 'force-dynamic';

const VERIFICATION_SERVICE_BASE_URL = process.env.VERIFICATION_SERVICE_BASE_URL;
const UPLOAD_SERVICE_BASE_URL = process.env.UPLOAD_SERVICE_BASE_URL;

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

interface DownloadResult {
  buffer: Buffer;
  contentType: string;
}

interface ForgeryDetectionResult {
  status: 'pending' | 'completed' | 'error';
  contentType?: 'image' | 'video';
  result?: {
    isManipulated: boolean;
    confidence: number;
    details: {
      imageManipulation?: {
        isManipulated: boolean;
        confidence: number;
      };
      ganDetection?: {
        isGan: boolean;
        realConfidence: number;
        fakeConfidence: number;
      };
      faceManipulation?: {
        isDeepfake: boolean;
        confidence: number;
      };
      audioDeepfake?: boolean | null;
    };
  };
  message?: string;
}

async function downloadContent(url: string): Promise<DownloadResult> {
  logger.info(`Downloading content from URL: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new ContentDownloadError(`Failed to download content: ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const buffer = await response.arrayBuffer().then(Buffer.from);
  logger.info(`Content downloaded. Size: ${buffer.length} bytes`);
  return { buffer, contentType };
}

async function detectForgery(contentBuffer: Buffer, contentType: string, filename: string): Promise<ForgeryDetectionResult> {
  logger.info(`Detecting forgery for file: ${filename}, Type: ${contentType}`);
  const formData = new FormData();
  const isImage = contentType.startsWith('image');
  const endpoint = 'detect_forgery';
  const fileAttributeName = isImage ? 'image_file' : 'video_file';

  formData.append(fileAttributeName, contentBuffer, { filename, contentType });

  const response = await fetch(`${VERIFICATION_SERVICE_BASE_URL}/detect_forgery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_url: contentUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ExternalServiceError(`Verification service error: ${errorText}`);
  }

  const apiResponse = await response.json();
  
  if (isImage) {
    return processImageForgeryResult(apiResponse);
  } else {
    return processVideoForgeryResult(apiResponse);
  }
}

function processImageForgeryResult(apiResponse: any): ForgeryDetectionResult {
  const imageManipulation = apiResponse.image_manipulation;
  const ganDetection = apiResponse.gan_detection;
  const faceManipulation = apiResponse.face_manipulation;

  const isManipulated = imageManipulation.is_manipulated || ganDetection.is_gan || faceManipulation.is_deepfake;
  const confidence = Math.max(
    parseFloat(imageManipulation.confidence) || 0,
    ganDetection.fake_confidence,
    faceManipulation.confidence
  );

  return {
    status: 'completed',
    contentType: 'image',
    result: {
      isManipulated,
      confidence,
      details: {
        imageManipulation: {
          isManipulated: imageManipulation.is_manipulated,
          confidence: parseFloat(imageManipulation.confidence) || 0
        },
        ganDetection: {
          isGan: ganDetection.is_gan,
          realConfidence: ganDetection.real_confidence,
          fakeConfidence: ganDetection.fake_confidence
        },
        faceManipulation: {
          isDeepfake: faceManipulation.is_deepfake,
          confidence: faceManipulation.confidence
        }
      }
    }
  };
}

function processVideoForgeryResult(apiResponse: any): ForgeryDetectionResult {
  const imageManipulation = apiResponse.image_manipulation;
  const faceManipulation = apiResponse.face_manipulation;
  const ganDetection = apiResponse.gan_detection;

  const isManipulated = imageManipulation.collective_detection || faceManipulation.collective_detection || ganDetection.collective_detection;
  const confidence = Math.max(
    imageManipulation.collective_confidence,
    faceManipulation.collective_confidence,
    ganDetection.collective_confidence
  );

  return {
    status: 'completed',
    contentType: 'video',
    result: {
      isManipulated,
      confidence,
      details: {
        imageManipulation: {
          isManipulated: imageManipulation.collective_detection,
          confidence: imageManipulation.collective_confidence
        },
        faceManipulation: {
          isDeepfake: faceManipulation.collective_detection,
          confidence: faceManipulation.collective_confidence
        },
        ganDetection: {
          isGan: ganDetection.collective_detection,
          realConfidence: ganDetection.collective_detection ? 0 : 100,
          fakeConfidence: ganDetection.collective_confidence
        },
        audioDeepfake: apiResponse.audio_deepfake
      }
    }
  };
}

let isNeo4jInitialized = false;

async function ensureNeo4jInitialized() {
  if (!isNeo4jInitialized) {
    await initializeNeo4j();
    isNeo4jInitialized = true;
    logger.info('Neo4j initialized');
  }
  ensureNeo4jConnection();
}
let contentUrl: string;

async function processForgeryDetection(contentId: string): Promise<ForgeryDetectionResult> {
  try {
    contentUrl = `https://utfs.io/f/${contentId}`;
    logger.info(`Processing content for forgery detection: ${contentUrl}`);

    const { buffer: contentBuffer, contentType } = await downloadContent(contentUrl);
    const filename = `content_${contentId}.${contentType.split('/')[1]}`;
    
    return await detectForgery(contentBuffer, contentType, filename);
  } catch (error) {
    logger.error('Error in forgery detection:', error);
    return {
      status: 'error',
      message: 'Forgery detection process failed',
    };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      throw new RateLimitError('Rate limit exceeded');
    }

    const contentId = params.id;
    if (!contentId) {
      throw new ValidationError('Content ID is required');
    }

    await ensureNeo4jInitialized();

    const cacheKey = `forgery_detection:${contentId}`;
    let detectionStatus = cache.get<ForgeryDetectionResult>(cacheKey);

    if (!detectionStatus) {
      detectionStatus = { status: 'pending', message: 'Forgery detection started' };
      cache.set(cacheKey, detectionStatus);
      
      // Process forgery detection asynchronously
      processForgeryDetection(contentId).then(result => {
        cache.set(cacheKey, result);
      }).catch(logger.error);
    }

    return NextResponse.json(detectionStatus);

  } catch (error) {
    logger.error('Error in forgery detection:', error);
    const errorResponse = {
      error: error instanceof Error ? error.message : 'Internal server error',
      status: error instanceof ValidationError ? 400 :
              error instanceof AuthenticationError ? 401 :
              error instanceof AuthorizationError ? 403 :
              error instanceof RateLimitError ? 429 :
              error instanceof ExternalServiceError ? 502 : 500
    };
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}