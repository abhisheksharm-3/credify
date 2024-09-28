import { NextRequest, NextResponse } from 'next/server';
import fetch, { Response } from 'node-fetch';
import NodeCache from 'node-cache';
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
import { analyzeImageWithGemini, analyzeVideoWithGemini } from '@/services/geminiService';

export const dynamic = 'force-dynamic';

// Initialize Neo4j
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

// Initialize cache
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Interfaces
interface ContentInfo {
  contentUrl: string;
  contentType: string;
  filename: string;
  endpoint: string;
}

interface VerificationStatus {
  status: 'pending' | 'completed' | 'error';
  result?: VerificationResult;
  geminiAnalysis?: string;
  message?: string;
}

// Helper Functions
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
    const timeoutId = setTimeout(() => controller.abort(), 600000);

    const contentTypeResponse: Response = await fetch(contentUrl, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!contentTypeResponse.ok) {
      throw new Error(`Failed to fetch content type: ${contentTypeResponse.statusText}`);
    }
    const contentType: string = contentTypeResponse.headers.get('content-type') || 'application/octet-stream';
    const filename = contentTypeResponse.headers.get('content-disposition')?.split('filename=')[1] || 'unknown';
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

async function verifyContent({ contentUrl, endpoint }: ContentInfo, geminiAnalysis: string): Promise<VerificationResult> {
  const cacheKey = `verificationResult:${contentUrl}`;
  const cachedResult = cache.get<VerificationResult>(cacheKey);
  if (cachedResult) {
    console.log(`[verifyContent] Cache hit for URL: ${contentUrl}`);
    return cachedResult;
  }

  console.log(`[verifyContent] Verifying content at URL: ${contentUrl}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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

    const apiResponse = await response.json() as { message: string; result: VerificationResult };
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
        return { ...existingResult};
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

async function storeVerifiedContent(verificationResult: VerificationResult, userId: string, contentInfo: ContentInfo, contentId: string, geminiAnalysis: string): Promise<void> {
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

async function fetchContentBuffer(contentUrl: string): Promise<Buffer> {
  const response = await fetch(contentUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch content: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function processVerification(contentId: string, userId: string): Promise<void> {
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

    const existingVerificationResult = await handleExistingVerification(contentHash, userId);
    if (!existingVerificationResult) {
      await Promise.all([
        storeContentVerificationAndUser(verificationResult, userId),
        storeVerifiedContent(verificationResult, userId, contentInfo, contentId, geminiAnalysis)
      ]);
    }

    const finalResult: VerificationStatus = {
      status: 'completed',
      result: verificationResult,
      geminiAnalysis,
      message: existingVerificationResult ? 'Existing content verified' : 'New content verified, stored, and analyzed with Gemini',
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

// Main POST handler
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
    const user = await getLoggedInUser();
    const userId = user?.$id || "";
    console.log(`[POST] User ID: ${userId}`);

    const cacheKey = `verification:${contentId}`;
    let verificationStatus = cache.get<VerificationStatus>(cacheKey);

    if (!verificationStatus) {
      // Start the verification process
      verificationStatus = { status: 'pending', message: 'Verification process started' };
      cache.set(cacheKey, verificationStatus);
      processVerification(contentId, userId).catch(console.error);
    }

    console.log('[POST] Returning verification status');
    return NextResponse.json(verificationStatus);
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