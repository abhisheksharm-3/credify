import { getContentVerificationOnly } from '@/lib/server/neo4jhelpers';
import { AnalysisStatus } from '@/lib/types';
import logger from '@/lib/logger';
import { downloadContent } from '@/lib/serverUtils/contentDownloader';
import { getContentHash } from './contentHasher';

export async function processAnalysis(contentId: string): Promise<AnalysisStatus> {
  try {
    const contentUrl = `https://utfs.io/f/${contentId}`;
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