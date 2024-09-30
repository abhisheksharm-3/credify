import { getContentVerificationAndUser, addUserToContent, storeContentVerificationAndUser } from '@/lib/server/neo4jhelpers';
import { createAdminClient } from '@/lib/server/appwrite';
import { Databases, ID } from 'node-appwrite';
import { VerificationResultType, ContentInfo } from '@/lib/types';

export async function handleExistingVerification(
  contentHash: string, 
  userId: string
): Promise<{ verificationResult: VerificationResultType | null, userExists: boolean }> {
  console.log(`[handleExistingVerification] Checking existing verification for contentHash: ${contentHash}, userId: ${userId}`);
  
  try {
    const { verificationResult: existingResult, userExists } = await getContentVerificationAndUser(contentHash, userId);

    if (existingResult) {
      if (!userExists) {
        await addUserToContent(contentHash, userId);
        console.log(`[handleExistingVerification] User associated with existing content`);
      } else {
        console.log(`[handleExistingVerification] Existing verification found for user`);
      }
      return { verificationResult: existingResult, userExists };
    }

    console.log(`[handleExistingVerification] No existing verification found`);
    return { verificationResult: null, userExists: false };
  } catch (error) {
    console.error(`[handleExistingVerification] Error checking existing verification: ${error}`);
    throw error;
  }
}

export async function storeVerifiedContent(verificationResult: VerificationResultType, userId: string, contentInfo: ContentInfo, contentId: string, geminiAnalysis: string): Promise<void> {
  console.log(`[storeVerifiedContent] Storing verified content for userId: ${userId}, contentId: ${contentId}`);
  try {
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);

    const verifiedContent = {
      video_hash: verificationResult.video_hash || null,
      collective_audio_hash: verificationResult.collective_audio_hash || null,
      image_hash: verificationResult.image_hash || null,
      userId: userId,
      media_title: contentInfo.filename,
      media_type: contentInfo.contentType,
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
    console.log(`[storeVerifiedContent] Verified content stored successfully`);
  } catch (error) {
    console.error(`[storeVerifiedContent] Error storing verified content: ${error}`);
    throw error;
  }
}