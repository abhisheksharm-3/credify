import { NextRequest, NextResponse } from 'next/server';
import fetch, { Response } from 'node-fetch';
import { 
  initializeNeo4j, 
  getContentVerificationAndUser, 
  storeContentVerificationAndUser, 
  addUserToContent, 
  VerificationResult, 
  ensureNeo4jConnection 
} from '@/lib/server/neo4jhelpers';
import { createAdminClient, getLoggedInUser } from '@/lib/server/appwrite';
import { Databases, ID } from 'node-appwrite';
import NodeCache from 'node-cache';

export const dynamic = 'force-dynamic';

let neo4jInitialized = false;
const initializeNeo4jPromise = initializeNeo4j()
  .then(() => {
    neo4jInitialized = true;
    console.log('[Neo4j] Initialized successfully');
  })
  .catch(error => {
    console.error('[Neo4j] Initialization failed:', error);
    throw error;
  });

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
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const contentTypeResponse: Response = await fetch(contentUrl, { 
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!contentTypeResponse.ok) {
      throw new Error(`Failed to fetch content type: ${contentTypeResponse.statusText}`);
    }
    const contentType: string = contentTypeResponse.headers.get('content-type') || 'application/octet-stream';
    const filename = `content_${contentId}.${contentType.split('/')[1]}`;
    const endpoint = contentType.startsWith('image/') ? 'verify_image' : 'fingerprint';

    const contentInfo: ContentInfo = { contentUrl, contentType, filename, endpoint };
    cache.set(cacheKey, contentInfo);
    console.log(`[getContentInfo] Content info retrieved and cached: ${JSON.stringify(contentInfo)}`);
    return contentInfo;
  } catch (error) {
    console.error(`[getContentInfo] Error fetching content info: ${error}`);
    throw error;
  }
}

async function verifyContent({ contentUrl, endpoint }: ContentInfo): Promise<VerificationResult> {
  const cacheKey = `verificationResult:${contentUrl}`;
  const cachedResult = cache.get<VerificationResult>(cacheKey);
  if (cachedResult) {
    console.log(`[verifyContent] Cache hit for URL: ${contentUrl}`);
    return cachedResult;
  }

  console.log(`[verifyContent] Verifying content at URL: ${contentUrl}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Reduced timeout to 30 seconds

    const response: Response = await fetch(`${process.env.VERIFICATION_SERVICE_BASE_URL}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({ url: contentUrl }),
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[verifyContent] Verification service error: ${errorText}`);
      throw new Error(`Verification service error: ${errorText}`);
    }

    const apiResponse: ApiResponse = await response.json() as ApiResponse;
    cache.set(cacheKey, apiResponse.result);
    console.log(`[verifyContent] Content verified successfully and cached`);
    return apiResponse.result;
  } catch (error) {
    console.error(`[verifyContent] Error during content verification: ${error}`);
    throw error;
  }
}

async function handleExistingVerification(contentHash: string, userId: string): Promise<VerificationResult | null> {
  console.log(`[handleExistingVerification] Checking existing verification for contentHash: ${contentHash}, userId: ${userId}`);
  try {
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
  } catch (error) {
    console.error(`[handleExistingVerification] Error checking existing verification: ${error}`);
    throw error;
  }
}

async function storeVerifiedContent(verificationResult: VerificationResult, userId: string, contentInfo: ContentInfo, contentId: string): Promise<void> {
  console.log(`[storeVerifiedContent] Storing verified content for userId: ${userId}, contentId: ${contentId}`);
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
  } catch (error) {
    console.error(`[storeVerifiedContent] Error storing verified content: ${error}`);
    throw error;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('[POST] Received request to /api/content/getTag');
  const startTime = Date.now();
  
  try {
    if (!neo4jInitialized) {
      console.log('[POST] Waiting for Neo4j initialization...');
      await initializeNeo4jPromise;
    }

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

    const contentHash = verificationResult.image_hash || verificationResult.video_hash;
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
    console.log(`[POST] Memory usage: ${JSON.stringify(process.memoryUsage())}`);
  }
}