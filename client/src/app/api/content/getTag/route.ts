import { NextRequest, NextResponse } from 'next/server';
import fetch, { Response } from 'node-fetch';
import FormData from 'form-data';
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
import { analyzeContentWithGemini } from '@/services/geminiService';

export const dynamic = 'force-dynamic';

const VERIFICATION_SERVICE_BASE_URL = 'https://credify-ndpx.onrender.com';

let isNeo4jInitialized = false;

interface ContentInfo {
  contentBuffer: Buffer;
  contentType: string;
  filename: string;
}

async function initializeNeo4jIfNeeded() {
  if (!isNeo4jInitialized) {
    await initializeNeo4j();
    isNeo4jInitialized = true;
  }
  ensureNeo4jConnection();
}

async function downloadContent(url: string): Promise<Buffer> {
  const response: Response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download content: ${response.status} ${response.statusText}`);
  }
  return response.buffer();
}

async function getContentInfo(contentId: string): Promise<ContentInfo> {
  const contentUrl = `https://utfs.io/f/${contentId}`;
  const contentBuffer: Buffer = await downloadContent(contentUrl);
  const contentTypeResponse: Response = await fetch(contentUrl, { method: 'HEAD' });
  const contentType: string = contentTypeResponse.headers.get('content-type') || 'application/octet-stream';
  const filename = `content_${contentId}.${contentType.split('/')[1]}`;
  return { contentBuffer, contentType, filename };
}

async function verifyContent({ contentBuffer, contentType, filename }: ContentInfo): Promise<VerificationResult> {
  const formData = new FormData();
  const isImage = contentType.startsWith('image');
  const endpoint = isImage ? 'verify_image' : 'verify_video';
  const fileAttributeName = isImage ? 'image_file' : 'video_file';
  
  formData.append(fileAttributeName, contentBuffer, { filename, contentType });

  const response: Response = await fetch(`${VERIFICATION_SERVICE_BASE_URL}/${endpoint}`, {
    method: 'POST',
    body: formData as any,
    headers: formData.getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Verification service error: ${errorText}`);
  }

  return response.json() as Promise<VerificationResult>;
}

async function handleExistingVerification(contentHash: string, userId: string, existingResult: VerificationResult | null, userExists: boolean) {
  if (existingResult) {
    if (!userExists) {
      await addUserToContent(contentHash, userId);
      return { ...existingResult, message: 'User associated with existing content' };
    }
    return existingResult;
  }
  return null;
}

async function storeVerifiedContent(verificationResult: VerificationResult, userId: string, contentInfo: ContentInfo, contentId: string, geminiAnalysis: string) {
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

  return databases.createDocument(
    process.env.APPWRITE_DATABASE_ID!,
    process.env.APPWRITE_VERIFIED_CONTENT_COLLECTION_ID!,
    ID.unique(),
    verifiedContent
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('Received request to /api/content/getTag');
  try {
    await initializeNeo4jIfNeeded();
    
    const { contentId } = await req.json();
    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const user = await getLoggedInUser();
    const userId = user?.$id || "";

    const contentInfo = await getContentInfo(contentId);
    const verificationResult = await verifyContent(contentInfo);

    // Perform Gemini API analysis
    const geminiAnalysis = await analyzeContentWithGemini(contentInfo.contentBuffer, contentInfo.contentType);

    const contentHash = verificationResult.image_hash || verificationResult.video_hash;
    if (!contentHash) {
      throw new Error('No content hash found in verification result');
    }

    const { verificationResult: existingResult, userExists } = await getContentVerificationAndUser(contentHash, userId);
    const existingVerificationResult = await handleExistingVerification(contentHash, userId, existingResult, userExists);
    if (existingVerificationResult) {
      return NextResponse.json({...existingVerificationResult, geminiAnalysis});
    }

    await storeContentVerificationAndUser(verificationResult, userId);
    const storedContent = await storeVerifiedContent(verificationResult, userId, contentInfo, contentId, geminiAnalysis);

    return NextResponse.json({
      ...verificationResult,
      storedContentId: storedContent.$id,
      geminiAnalysis,
      message: 'New content verified and stored',
    });
  } catch (error) {
    console.error('Error in content verification:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await closeNeo4jConnection();
  }
}