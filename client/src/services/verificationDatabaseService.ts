// @/lib/databaseService.ts

import { Databases, ID } from 'node-appwrite';
import { createAdminClient } from '@/lib/server/appwrite';
import { VerificationResultType, FileInfoType } from '@/lib/types';
import logger from '@/lib/logger';

export async function storeVerifiedContent(
  verificationResult: VerificationResultType,
  userId: string,
  contentInfo: FileInfoType,
  contentId: string,
  geminiAnalysis: string
): Promise<void> {
  logger.info(`[storeVerifiedContent] Storing verified content for userId: ${userId}, contentId: ${contentId}`);
  try {
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);

    const verifiedContent = {
      video_hash: verificationResult.video_hash || null,
      collective_audio_hash: verificationResult.collective_audio_hash || null,
      image_hash: verificationResult.image_hash || null,
      is_tampered: verificationResult.is_tampered || false,
      is_deepfake: verificationResult.is_deepfake || false,
      userId: userId,
      media_title: contentInfo.name,
      media_type: contentInfo.media_type,
      contentId: contentId,
      verificationDate: new Date().toISOString(),
      fact_check: geminiAnalysis,
    };

    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_VERIFIED_CONTENT_COLLECTION_ID!,
      ID.unique(),
      verifiedContent
    );
    logger.info(`[storeVerifiedContent] Verified content stored successfully`);
  } catch (error) {
    logger.error(`[storeVerifiedContent] Error storing verified content:`, error);
    throw error;
  }
}