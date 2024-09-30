import { getContentInfo } from './contentInfoService';
import { analyzeImageWithGemini, analyzeVideoWithGemini } from '@/services/geminiService';
import { VerificationStatus } from '@/lib/types';
import NodeCache from 'node-cache';
import { verifyContent } from './contentVerifcationService';
import { handleExistingVerification, storeVerifiedContent } from './storageService';
import { storeContentVerificationAndUser } from '@/lib/server/neo4jhelpers';

export async function processVerification(contentId: string, userId: string, cache: NodeCache): Promise<void> {
  try {
    const contentInfo = await getContentInfo(contentId);
    const contentBuffer = await fetchContentBuffer(contentInfo.contentUrl);
    
    console.log('[processVerification] Performing Gemini analysis');
    const geminiAnalysis = contentInfo.contentType.startsWith('image/') 
      ? await analyzeImageWithGemini(contentBuffer, contentInfo.contentType)
      : await analyzeVideoWithGemini(contentInfo.contentUrl, contentInfo.contentType);
    console.log('[processVerification] Gemini analysis completed');

    console.log('[processVerification] Starting content verification');
    const verificationResult = await verifyContent(contentInfo, geminiAnalysis);
    const contentHash = verificationResult.image_hash || verificationResult.video_hash;

    if (!contentHash) {
      throw new Error('No content hash found in verification result');
    }

    const {verificationResult: existingVerificationResult, userExists} = await handleExistingVerification(contentHash, userId);
    if (!existingVerificationResult) {
      await Promise.all([
        storeContentVerificationAndUser(verificationResult, userId),
        storeVerifiedContent(verificationResult, userId, contentInfo, contentId, geminiAnalysis)
      ]);
    } else if(!userExists) {
      await storeVerifiedContent(verificationResult, userId, contentInfo, contentId, geminiAnalysis)
    }
    console.log('[processVerification] Content verification completed')

    const finalResult: VerificationStatus = {
      status: 'completed',
      result: verificationResult,
      geminiAnalysis,
      message: existingVerificationResult ? 'Existing content verified' : 'New content verified, stored, and analyzed with Gemini',
      existing: existingVerificationResult ? true : false,
    };

    cache.set(`verification:${contentId}`, finalResult);
  } catch (error) {
    console.error('[processVerification] Error:', error);
    cache.set(`verification:${contentId}`, {
      status: 'error',
      message: 'Verification process failed',
    });
  }
}

async function fetchContentBuffer(contentUrl: string): Promise<Buffer> {
  const response = await fetch(contentUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch content: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}