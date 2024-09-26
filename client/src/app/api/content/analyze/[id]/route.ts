
import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { initializeNeo4j, getContentVerificationOnly, ensureNeo4jConnection, VerificationResult } from '@/lib/server/neo4jhelpers';
import {
  ContentDownloadError,
  ContentHashError,
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

// Initialize cache with a longer TTL and check period
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

interface DownloadResult {
  buffer: Buffer;
  contentType: string;
}

interface ApiResponse {
  message: string;
  result: {
    frame_hashes: string[];
    audio_hashes: string[];
    image_hash: string | null;
    video_hash: string;
  }
}

interface AnalysisStatus {
  status: 'pending' | 'found' | 'not_found' | 'error';
  contentHash?: string;
  verificationResult?: VerificationResult;
  creatorsId?: string;
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

async function getContentHash(contentBuffer: Buffer, contentType: string, filename: string, contentUrl: string): Promise<string> {
  logger.info(`Getting content hash for file: ${filename}, Type: ${contentType}`);
  const formData = new FormData();
  const isImage = contentType.startsWith('image');
  const endpoint = isImage ? 'verify_image' : 'fingerprint';
  const fileAttributeName = isImage ? 'image_file' : 'video_file';

  formData.append(fileAttributeName, contentBuffer, { filename, contentType });

  const response = await fetch(`${VERIFICATION_SERVICE_BASE_URL}/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify({ url: contentUrl }),
    headers: formData.getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ContentHashError(`Verification service error: ${errorText}`);
  }

  const apiResponse: ApiResponse = await response.json() as ApiResponse;
  const hash = apiResponse.result.image_hash || apiResponse.result.video_hash;
  if (!hash) {
    throw new ContentHashError('No hash returned from verification service');
  }
  logger.info(`Content hash obtained: ${hash}`);
  return hash;
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

async function processAnalysis(contentId: string): Promise<AnalysisStatus> {
  try {
    const contentUrl = `${UPLOAD_SERVICE_BASE_URL}/${contentId}`;
    logger.info(`Processing content: ${contentUrl}`);

    const { buffer: contentBuffer, contentType } = await downloadContent(contentUrl);
    const filename = `content_${contentId}.${contentType.split('/')[1]}`;
    const contentHash = await getContentHash(contentBuffer, contentType, filename, contentUrl);

    const { verificationResult: existingResult, uploadInfo } = await getContentVerificationOnly(contentHash);

    if (existingResult) {
      return {
        status: 'found',
        contentHash,
        verificationResult: existingResult,
        creatorsId: uploadInfo?.userId,
        message: 'Content hash found in database'
      };
    } else {
      return {
        status: 'not_found',
        contentHash,
        message: 'Content hash not found in database'
      };
    }
  } catch (error) {
    logger.error('Error in content analysis:', error);
    return {
      status: 'error',
      message: 'Analysis process failed',
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

    // TODO: Implement authentication and authorization checks
    // if (!isAuthenticated(request)) throw new AuthenticationError('Not authenticated');
    // if (!isAuthorized(request, 'analyze_content')) throw new AuthorizationError('Not authorized');

    await ensureNeo4jInitialized();

    const cacheKey = `analysis:${contentId}`;
    let analysisStatus = cache.get<AnalysisStatus>(cacheKey);

    if (!analysisStatus) {
      analysisStatus = { status: 'pending', message: 'Analysis started' };
      cache.set(cacheKey, analysisStatus);
      
      // Process analysis asynchronously
      processAnalysis(contentId).then(result => {
        cache.set(cacheKey, result);
      }).catch(logger.error);
    }

    return NextResponse.json(analysisStatus);

  } catch (error) {
    logger.error('Error in content analysis:', error);
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
