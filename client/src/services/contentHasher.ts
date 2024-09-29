import { Buffer } from 'buffer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import logger from '@/lib/logger';
import { ContentHashError } from '@/lib/errors';
import { ApiResponseType } from '@/lib/types';

export async function getContentHash(contentBuffer: Buffer, contentType: string, filename: string, contentUrl: string): Promise<string> {
  logger.info(`Getting content hash for file: ${filename}, Type: ${contentType}`);
  const formData = new FormData();
  const isImage = contentType.startsWith('image');
  const endpoint = isImage ? 'verify_image' : 'fingerprint';
  const fileAttributeName = isImage ? 'image_file' : 'video_file';

  formData.append(fileAttributeName, contentBuffer, { filename, contentType });

  const response = await fetch(`${process.env.VERIFICATION_SERVICE_BASE_URL}/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify({ url: contentUrl }),
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new ContentHashError(`Verification service error: ${errorText}`);
  }

  const apiResponse: ApiResponseType = await response.json() as ApiResponseType;
  const hash = apiResponse.result.image_hash || apiResponse.result.video_hash;
  if (!hash) {
    throw new ContentHashError('No hash returned from verification service');
  }
  logger.info(`Content hash obtained: ${hash}`);
  return hash;
}