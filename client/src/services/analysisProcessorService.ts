import { downloadContent } from './contentDownloader';
import { getContentHash } from './contentHasher';
import { getContentVerificationOnly } from '@/lib/server/neo4jhelpers';
import logger from '@/lib/logger';
import { AnalysisStatus } from '@/lib/types';

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
        verified: true,
        status: 'found',
        contentHash,
        creatorsId: uploadInfo?.userId,
        message: 'Content hash found in database'
      };
    } else {
      return {
        verified: false,
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