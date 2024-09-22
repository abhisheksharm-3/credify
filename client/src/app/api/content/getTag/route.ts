import { NextRequest, NextResponse } from 'next/server';
import { 
  initializeNeo4j, 
  getContentVerificationAndUser, 
  storeContentVerificationAndUser, 
  addUserToContent,
  VerificationResult
} from '@/lib/server/neo4jhelpers';
import { createAdminClient, getLoggedInUser } from '@/lib/server/appwrite';
import { Databases, ID } from 'node-appwrite';
import NodeCache from 'node-cache';

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

// Types
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

// Helper functions
async function getContentInfo(contentId: string): Promise<ContentInfo> {
  const cacheKey = `contentInfo:${contentId}`;
  const cachedInfo = cache.get<ContentInfo>(cacheKey);
  if (cachedInfo) return cachedInfo;

  const contentUrl = `https://utfs.io/f/${contentId}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
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
    return contentInfo;
  } catch (error) {
    console.error(`[getContentInfo] Error: ${error}`);
    throw error;
  }
}

async function verifyContent({ contentUrl, endpoint, contentType }: ContentInfo): Promise<VerificationResult | string> {
  const cacheKey = `verificationResult:${contentUrl}`;
  const cachedResult = cache.get<VerificationResult>(cacheKey);
  if (cachedResult) return cachedResult;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);

  try {
    const response: Response = await fetch(`${process.env.VERIFICATION_SERVICE_BASE_URL}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({ url: contentUrl }),
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Verification service error: ${errorText}`);
    }

    const apiResponse: ApiResponse = await response.json() as ApiResponse;
    
    if (contentType.startsWith('video/')) {
      const jobResponse = apiResponse.result as unknown as JobResponse;
      return jobResponse.job_id;
    } else {
      cache.set(cacheKey, apiResponse.result);
      return apiResponse.result;
    }
  } catch (error) {
    console.error(`[verifyContent] Error: ${error}`);
    throw error;
  }
}

async function checkVideoVerificationStatus(jobId: string): Promise<JobResponse> {
  try {
    const response = await fetch(`${process.env.VERIFICATION_SERVICE_BASE_URL}/status/${jobId}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status check error: ${errorText}`);
    }

    return await response.json() as JobResponse;
  } catch (error) {
    console.error(`[checkVideoVerificationStatus] Error: ${error}`);
    throw error;
  }
}

async function handleExistingVerification(contentHash: string, userId: string): Promise<VerificationResult | null> {
  const { verificationResult: existingResult, userExists } = await getContentVerificationAndUser(contentHash, userId);
  
  if (existingResult) {
    if (!userExists) {
      await addUserToContent(contentHash, userId);
    }
    return existingResult;
  }
  
  return null;
}

async function storeVerifiedContent(verificationResult: VerificationResult, userId: string, contentInfo: ContentInfo, contentId: string): Promise<void> {
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
  } catch (error) {
    console.error(`[storeVerifiedContent] Error: ${error}`);
    throw error;
  }
}

// Main handler functions
export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    if (!neo4jInitialized) {
      await initializeNeo4jPromise;
    }

    const { contentId } = await req.json();
    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const [user, contentInfo] = await Promise.all([
      getLoggedInUser(),
      getContentInfo(contentId)
    ]);
    const userId = user?.$id || "";

    const verificationResult = await verifyContent(contentInfo);

    if (typeof verificationResult === 'string') {
      return NextResponse.json({
        message: 'Video verification in progress',
        jobId: verificationResult,
        status: 'processing'
      }, { status: 202 });
    }

    const contentHash = verificationResult.image_hash || verificationResult.video_hash;
    if (!contentHash) {
      throw new Error('No content hash found in verification result');
    }

    const existingVerificationResult = await handleExistingVerification(contentHash, userId);
    if (existingVerificationResult) {
      return NextResponse.json(existingVerificationResult);
    }

    await Promise.all([
      storeContentVerificationAndUser(verificationResult, userId),
      storeVerifiedContent(verificationResult, userId, contentInfo, contentId)
    ]);

    return NextResponse.json({
      ...verificationResult,
      message: 'New content verified and stored',
    });
  } catch (error) {
    console.error('[POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    console.log(`[POST] Total execution time: ${Date.now() - startTime}ms`);
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
    } else {
      // Return the current status without error, even if it's still processing
      return NextResponse.json({ message: `Video verification ${jobResponse.status}`, status: jobResponse.status });
    }
  } catch (error) {
    console.error('[GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error), status: 'error' },
      { status: 500 }
    );
  }
}