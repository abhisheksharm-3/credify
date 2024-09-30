// @/lib/forgeryDetection.ts

import { downloadContent } from '@/lib/serverUtils/contentDownloader';
import { detectForgery } from '@/lib/serverUtils/verificationService';
import { ForgeryDetectionResult } from '@/lib/types';
import logger from '@/lib/logger';

export async function processForgeryDetection(contentId: string): Promise<ForgeryDetectionResult> {
  try {
    const contentUrl = `https://utfs.io/f/${contentId}`;
    logger.info(`Processing content for forgery detection: ${contentUrl}`);
    const filename = contentId;
    
    return await detectForgery(filename, contentUrl, contentId);
  } catch (error) {
    logger.error('Error in forgery detection:', error);
    return {
      status: 'error',
      message: 'Forgery detection process failed',
    };
  }
}