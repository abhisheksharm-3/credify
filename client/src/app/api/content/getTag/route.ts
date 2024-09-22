import { NextRequest, NextResponse } from 'next/server';
import fetch, { Response } from 'node-fetch';
import { 
  initializeNeo4j, 
  getContentVerificationAndUser, 
  storeContentVerificationAndUser, 
  addUserToContent,
  ensureNeo4jConnection, 
  VerificationResult
} from '@/lib/server/neo4jhelpers';
import { createAdminClient, getLoggedInUser } from '@/lib/server/appwrite';
import { Databases, ID, Models } from 'node-appwrite';
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

interface JobResponse {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  result?: VerificationResult;
}

async function getContentInfo(contentId: string): Promise<ContentInfo> {
  console.time('getContentInfo');
  const cacheKey = `contentInfo:${contentId}`;
  const cachedInfo = cache.get<ContentInfo>(cacheKey);
  if (cachedInfo) {
    console.log(`[getContentInfo] Cache hit for contentId: ${contentId}`);
    console.timeEnd('getContentInfo');
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
    console.timeEnd('getContentInfo');
    return contentInfo;
  } catch (error) {
    console.error(`[getContentInfo] Error fetching content info: ${error}`);
    console.timeEnd('getContentInfo');
    throw error;
  }
}

async function verifyContent({ contentUrl, endpoint, contentType }: ContentInfo): Promise<VerificationResult | string> {
  console.time('verifyContent');
  const cacheKey = `verificationResult:${contentUrl}`;
  const cachedResult = cache.get<VerificationResult>(cacheKey);
  if (cachedResult) {
    console.log(`[verifyContent] Cache hit for URL: ${contentUrl}`);
    console.timeEnd('verifyContent');
    return cachedResult;
  }

  console.log(`[verifyContent] Verifying content at URL: ${contentUrl}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    console.log(`[verifyContent] Sending request to: ${process.env.VERIFICATION_SERVICE_BASE_URL}/${endpoint}`);
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
    
    if (contentType.startsWith('video/')) {
      // For videos, return the job ID
      const jobResponse = apiResponse.result as unknown as JobResponse;
      console.log(`[verifyContent] Video verification job started: ${jobResponse.job_id}`);
      console.timeEnd('verifyContent');
      return jobResponse.job_id;
    } else {
      // For images, cache and return the result
      cache.set(cacheKey, apiResponse.result);
      console.log(`[verifyContent] Content verified successfully and cached`);
      console.timeEnd('verifyContent');
      return apiResponse.result;
    }
  } catch (error) {
    console.error(`[verifyContent] Error during content verification: ${error}`);
    console.timeEnd('verifyContent');
    throw error;
  }
}

async function checkVideoVerificationStatus(jobId: string): Promise<JobResponse> {
  console.log(`[checkVideoVerificationStatus] Checking status for job: ${jobId}`);
  try {
    const response = await fetch(`${process.env.VERIFICATION_SERVICE_BASE_URL}/status/${jobId}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[checkVideoVerificationStatus] Status check error: ${errorText}`);
      throw new Error(`Status check error: ${errorText}`);
    }

    const jobResponse: JobResponse = await response.json() as JobResponse;
    console.log(`[checkVideoVerificationStatus] Job status: ${jobResponse.status} for job: ${jobId}`);
    return jobResponse;
  } catch (error) {
    console.error(`[checkVideoVerificationStatus] Error checking video verification status: ${error}`);
    throw error;
  }
}

async function handleExistingVerification(contentHash: string, userId: string): Promise<VerificationResult | null> {
  console.time('handleExistingVerification');
  console.log(`[handleExistingVerification] Checking existing verification for contentHash: ${contentHash}, userId: ${userId}`);
  try {
    const { verificationResult: existingResult, userExists } = await getContentVerificationAndUser(contentHash, userId);
    
    if (existingResult) {
      if (!userExists) {
        await addUserToContent(contentHash, userId);
        console.log(`[handleExistingVerification] User associated with existing content`);
        console.timeEnd('handleExistingVerification');
        console.log(`[handleExistingVerification] User associated with existing content`);
        return existingResult;
      }
      console.log(`[handleExistingVerification] Existing verification found`);
      console.timeEnd('handleExistingVerification');
      return existingResult;
    }
    
    console.log(`[handleExistingVerification] No existing verification found`);
    console.timeEnd('handleExistingVerification');
    return null;
  } catch (error) {
    console.error(`[handleExistingVerification] Error checking existing verification: ${error}`);
    console.timeEnd('handleExistingVerification');
    throw error;
  }
}

async function storeVerifiedContent(verificationResult: VerificationResult, userId: string, contentInfo: ContentInfo, contentId: string): Promise<void> {
  console.time('storeVerifiedContent');
  console.log(`[storeVerifiedContent] Storing verified content for userId: ${userId}, contentId: ${contentId}`);
  try {
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);

    const verifiedContent = {
      video_hash: verificationResult.video_hash || null,
      collective_audio_hash: verificationResult.collective_audio_hash || null,
      image_hash: verificationResult.image_hash || null,
      audio_hash: verificationResult.audio_hash || null,
      frame_hash: verificationResult.frame_hash || null,
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
    console.timeEnd('storeVerifiedContent');
  } catch (error) {
    console.error(`[storeVerifiedContent] Error storing verified content: ${error}`);
    console.timeEnd('storeVerifiedContent');
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

    if (typeof verificationResult === 'string') {
      // This is a job ID for video verification
      console.log(`[POST] Video verification job started: ${verificationResult}`);
      return NextResponse.json({
        message: 'Video verification in progress',
        jobId: verificationResult,
        status: 'processing'
      }, { status: 202 });
    }

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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');
  const contentId = searchParams.get('contentId');

  if (!jobId || !contentId) {
    return NextResponse.json({ error: 'Job ID and Content ID are required' }, { status: 400 });
  }

  try {
    const jobResponse = await checkVideoVerificationStatus(jobId);
    if (jobResponse.status === 'completed' && jobResponse.result) {
      // Video verification completed
      const contentHash = jobResponse.result.video_hash;
      if (!contentHash) {
        throw new Error('No content hash found in verification result');
      }

      const user = await getLoggedInUser();
      const userId = user?.$id || "";

      const existingVerificationResult = await handleExistingVerification(contentHash, userId);
      if (existingVerificationResult) {
        return NextResponse.json({ ...existingVerificationResult, status: 'completed' });
      }

      const contentInfo = await getContentInfo(contentId);
      await Promise.all([
        storeContentVerificationAndUser(jobResponse.result, userId),
        storeVerifiedContent(jobResponse.result, userId, contentInfo, contentId)
      ]);

      return NextResponse.json({ ...jobResponse.result, status: 'completed' });
    } else if (jobResponse.status === 'processing') {
      // Video verification still in progress
      return NextResponse.json({ message: 'Video verification in progress', status: 'processing' }, { status: 202 });
    } else {
      // Verification failed or unexpected status
      return NextResponse.json({ error: 'Verification failed or unexpected status', status: 'error' }, { status: 500 });
    }
  } catch (error) {
    console.error('[GET] Error checking video verification status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error), status: 'error' },
      { status: 500 }
    );
  }
}