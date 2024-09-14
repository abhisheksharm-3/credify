// File: src/pages/api/content/analyze/[id].ts

import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { initializeNeo4j, getContentVerificationOnly, ensureNeo4jConnection, VerificationResult } from '@/lib/server/neo4jhelpers';
import {
  ContentDownloadError,
  ContentHashError,
  DatabaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ExternalServiceError
} from '@/lib/errors';
import logger from '@/lib/logger';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const VERIFICATION_SERVICE_BASE_URL = process.env.VERIFICATION_SERVICE_BASE_URL;
const UPLOAD_SERVICE_BASE_URL = process.env.UPLOAD_SERVICE_BASE_URL;

interface DownloadResult {
  buffer: Buffer;
  contentType: string;
}

async function downloadContent(url: string): Promise<DownloadResult> {
  logger.info(`Attempting to download content from URL: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new ContentDownloadError(`Failed to download content: ${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer().then(Buffer.from);
    logger.info(`Content downloaded successfully. Buffer size: ${buffer.length} bytes`);
    return { buffer, contentType };
  } catch (error) {
    logger.error('Error downloading content:', error);
    throw new ContentDownloadError('Failed to download content');
  }
}

async function getContentHash(contentBuffer: Buffer, contentType: string, filename: string): Promise<string> {
  logger.info(`Preparing to get content hash for file: ${filename}, Content-Type: ${contentType}`);
  const formData = new FormData();
  const isImage = contentType.startsWith('image');
  const endpoint = isImage ? 'verify_image' : 'verify_video';
  const fileAttributeName = isImage ? 'image_file' : 'video_file';

  formData.append(fileAttributeName, contentBuffer, { filename, contentType });

  try {
    const response = await fetch(`${VERIFICATION_SERVICE_BASE_URL}/${endpoint}`, {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ContentHashError(`Verification service error: ${errorText}`);
    }

    const result = await response.json() as VerificationResult;
    const hash = result.image_hash || result.video_hash;
    if (!hash) {
      throw new ContentHashError('No hash returned from verification service');
    }
    logger.info(`Content hash obtained: ${hash}`);
    return hash;
  } catch (error) {
    logger.error('Error getting content hash:', error);
    throw new ContentHashError('Failed to get content hash');
  }
}

let isNeo4jInitialized = false;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      throw new RateLimitError('Too many requests, please try again later.');
    }

    const contentId = params.id;
    logger.info(`Received request to /api/content/analyze for content ID: ${contentId}`);

    if (!contentId) {
      throw new ValidationError('Content ID is required');
    }

    // TODO: Add authentication check here
    // if (!isAuthenticated(request)) {
    //   throw new AuthenticationError('User is not authenticated');
    // }

    // TODO: Add authorization check here
    // if (!isAuthorized(request, 'analyze_content')) {
    //   throw new AuthorizationError('User is not authorized to analyze content');
    // }

    if (!isNeo4jInitialized) {
      await initializeNeo4j();
      isNeo4jInitialized = true;
      logger.info('Neo4j initialized successfully');
    }
    ensureNeo4jConnection();

    const contentUrl = `${UPLOAD_SERVICE_BASE_URL}/${contentId}`;
    logger.info(`Content URL: ${contentUrl}`);

    const { buffer: contentBuffer, contentType } = await downloadContent(contentUrl);

    const filename = `content_${contentId}.${contentType.split('/')[1]}`;
    const contentHash = await getContentHash(contentBuffer, contentType, filename);

    const { verificationResult: existingResult, uploadInfo } = await getContentVerificationOnly(contentHash);

    if (existingResult) {
      logger.info(`Hash found in database: ${contentHash}`);
      return NextResponse.json({
        contentHash,
        status: 'found',
        message: 'Content hash found in database',
        verificationResult: existingResult,
        creatorsId: uploadInfo
      });
    }

    logger.info(`Content hash not found in database: ${contentHash}`);
    return NextResponse.json({
      contentHash,
      status: 'not_found',
      message: 'Content hash not found in database'
    });

  } catch (error) {
    logger.error('Unhandled error in content verification:', error);
    if (error instanceof ContentDownloadError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (error instanceof ContentHashError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    } else if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    } else if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    } else if (error instanceof ExternalServiceError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    } else {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}