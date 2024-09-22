import { NextRequest, NextResponse } from 'next/server';
import fetch, { Response } from 'node-fetch';
import { 
  initializeNeo4j, 
  getContentVerificationAndUser, 
  storeContentVerificationAndUser, 
  addUserToContent, 
  closeNeo4jConnection, 
  VerificationResult, 
  ensureNeo4jConnection 
} from '@/lib/server/neo4jhelpers';
import { createAdminClient, getLoggedInUser } from '@/lib/server/appwrite';
import { Databases, ID } from 'node-appwrite';
import NodeCache from 'node-cache';

export const dynamic = 'force-dynamic';

// Initialize Neo4j connection outside of the request handler
initializeNeo4j().then(() => console.log('Neo4j initialized')).catch(console.error);

// Setup caching
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

interface ContentInfo {
  contentUrl: string;
  contentType: string;
  filename: string;
  endpoint: string;
}

interface ApiResponse {
  message: string;
  result: VerificationResult;
}

async function getContentInfo(contentId: string): Promise<ContentInfo> {
  const cacheKey = `contentInfo:${contentId}`;
  const cachedInfo = cache.get<ContentInfo>(cacheKey);
  if (cachedInfo) {
    console.log(`[getContentInfo] Cache hit for contentId: ${contentId}`);
    return cachedInfo;
  }

  console.log(`[getContentInfo] Fetching content info for contentId: ${contentId}`);
  const contentUrl = `https://utfs.io/f/${contentId}`;
  const contentTypeResponse: Response = await fetch(contentUrl, { method: 'HEAD' });
  const contentType: string = contentTypeResponse.headers.get('content-type') || 'application/octet-stream';
  const filename = `content_${contentId}.${contentType.split('/')[1]}`;
  const endpoint = contentType.startsWith('image/') ? 'verify_image' : 'fingerprint';

  const contentInfo: ContentInfo = { contentUrl, contentType, filename, endpoint };
  cache.set(cacheKey, contentInfo);
  console.log(`[getContentInfo] Content info retrieved and cached: ${JSON.stringify(contentInfo)}`);
  return contentInfo;
}

async function verifyContent({ contentUrl, endpoint }: ContentInfo): Promise<VerificationResult> {
  const cacheKey = `verificationResult:${contentUrl}`;
  const cachedResult = cache.get<VerificationResult>(cacheKey);
  if (cachedResult) {
    console.log(`[verifyContent] Cache hit for URL: ${contentUrl}`);
    return cachedResult;
  }

  console.log(`[verifyContent] Verifying content at URL: ${contentUrl}`);
  const response: Response = await fetch(`${process.env.VERIFICATION_SERVICE_BASE_URL}/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify({ url: contentUrl }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[verifyContent] Verification service error: ${errorText}`);
    throw new Error(`Verification service error: ${errorText}`);
  }

  const apiResponse: ApiResponse = await response.json() as ApiResponse;
  cache.set(cacheKey, apiResponse.result);
  console.log(`[verifyContent] Content verified successfully and cached`);
  return apiResponse.result;
}

async function handleExistingVerification(contentHash: string, userId: string): Promise<VerificationResult | null> {
  console.log(`[handleExistingVerification] Checking existing verification for contentHash: ${contentHash}, userId: ${userId}`);
  const { verificationResult: existingResult, userExists } = await getContentVerificationAndUser(contentHash, userId);
  
  if (existingResult) {
    if (!userExists) {
      await addUserToContent(contentHash, userId);
      console.log(`[handleExistingVerification] User associated with existing content`);
      return { ...existingResult, message: 'User associated with existing content' } as VerificationResult & { message: string };
    }
    console.log(`[handleExistingVerification] Existing verification found`);
    return existingResult;
  }
  
  console.log(`[handleExistingVerification] No existing verification found`);
  return null;
}

async function storeVerifiedContent(verificationResult: VerificationResult, userId: string, contentInfo: ContentInfo, contentId: string): Promise<void> {
  console.log(`[storeVerifiedContent] Storing verified content for userId: ${userId}, contentId: ${contentId}`);
  const { account } = await createAdminClient();
  const databases = new Databases(account.client);

  const verifiedContent = {
    video_hash: verificationResult.robust_video_hash || null,
    collective_audio_hash: verificationResult.collective_audio_hash || null,
    image_hash: verificationResult.robust_image_hash || null,
    is_tampered: verificationResult.is_tampered || false,
    is_deepfake: verificationResult.is_deepfake || false,
    userId: userId,
    media_title: contentInfo.filename,
    media_type: contentInfo.contentType,
    contentId: contentId,
    verificationDate: new Date().toISOString(),
  };

  await databases.createDocument(
    process.env.APPWRITE_DATABASE_ID!,
    process.env.APPWRITE_VERIFIED_CONTENT_COLLECTION_ID!,
    ID.unique(),
    verifiedContent
  );
  console.log(`[storeVerifiedContent] Verified content stored successfully`);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('[POST] Received request to /api/content/getTag');
  const startTime = Date.now();
  
  try {
    console.log('[POST] Parsing request body');
    const { contentId } = await req.json();
    if (!contentId) {
      console.log('[POST] Error: Content ID is required');
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    console.log(`[POST] Processing content with ID: ${contentId}`);
    const [user, contentInfo] = await Promise.all([
      getLoggedInUser(),
      getContentInfo(contentId)
    ]);
    const userId = user?.$id || "";
    console.log(`[POST] User ID: ${userId}`);

    console.log('[POST] Verifying content');
    const verificationResult = await verifyContent(contentInfo);

    const contentHash = verificationResult.robust_image_hash || verificationResult.robust_video_hash;
    if (!contentHash) {
      console.error('[POST] Error: No content hash found in verification result');
      throw new Error('No content hash found in verification result');
    }

    console.log('[POST] Checking for existing verification');
    const existingVerificationResult = await handleExistingVerification(contentHash, userId);
    if (existingVerificationResult) {
      console.log('[POST] Returning existing verification result');
      return NextResponse.json(existingVerificationResult);
    }

    console.log('[POST] Storing new verification result');
    await Promise.all([
      storeContentVerificationAndUser(verificationResult, userId),
      storeVerifiedContent(verificationResult, userId, contentInfo, contentId)
    ]);

    console.log('[POST] Returning new verification result');
    return NextResponse.json({
      ...verificationResult,
      message: 'New content verified and stored',
    });
  } catch (error) {
    console.error('[POST] Error in content verification:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    console.log(`[POST] Total execution time: ${Date.now() - startTime}ms`);
  }
}