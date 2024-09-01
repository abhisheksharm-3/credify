import { NextRequest, NextResponse } from 'next/server';
import fetch, { Response } from 'node-fetch';
import FormData from 'form-data';
import { initializeNeo4j, getContentVerificationAndUser, storeContentVerificationAndUser, addUserToContent, closeNeo4jConnection, VerificationResult, ensureNeo4jConnection } from '@/lib/server/neo4jhelpers';
import { getLoggedInUser } from '@/lib/server/appwrite';

export const dynamic = 'force-dynamic';

const VERIFICATION_SERVICE_BASE_URL = 'https://credify-ndpx.onrender.com';

async function downloadContent(url: string): Promise<Buffer> {
  const response: Response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download content: ${response.status} ${response.statusText}`);
  }
  return response.buffer();
}

async function verifyContent(contentBuffer: Buffer, contentType: string, filename: string): Promise<VerificationResult> {
  const formData = new FormData();
  const isImage = contentType.startsWith('image');
  const endpoint = isImage ? 'verify_image' : 'verify_video';
  const fileAttributeName = isImage ? 'image_file' : 'video_file';
  
  formData.append(fileAttributeName, contentBuffer, {
    filename,
    contentType,
  });

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

let isNeo4jInitialized = false;

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('Received request to /api/content/getTag');
  try {
    if (!isNeo4jInitialized) {
      await initializeNeo4j();
      isNeo4jInitialized = true;
    }
    ensureNeo4jConnection();
    
    const body: { contentId: string } = await req.json();
    const { contentId } = body;
    console.log('Parsed request body:', { contentId });

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const user = await getLoggedInUser();
    const userId = user?.$id || "";

    const contentUrl = `https://utfs.io/f/${contentId}`;
    console.log('Content URL:', contentUrl);

    console.log('Downloading content...');
    const contentBuffer: Buffer = await downloadContent(contentUrl);
    console.log('Content downloaded successfully');

    const contentTypeResponse: Response = await fetch(contentUrl, { method: 'HEAD' });
    const contentType: string = contentTypeResponse.headers.get('content-type') || 'application/octet-stream';
    console.log('Content type:', contentType);

    const filename = `content_${contentId}.${contentType.split('/')[1]}`;

    console.log(`Sending request to ${contentType.startsWith('image') ? 'image' : 'video'} verification service...`);
    const verificationResult: VerificationResult = await verifyContent(contentBuffer, contentType, filename);
    console.log('Verification result:', verificationResult);

    const contentHash = verificationResult.image_hash || verificationResult.video_hash;
    if (!contentHash) {
      throw new Error('No content hash found in verification result');
    }

    const { verificationResult: existingResult, userExists } = await getContentVerificationAndUser(contentHash, userId);
    
    if (existingResult) {
      console.log('Verification result found in database:', existingResult);
      if (userExists) {
        return NextResponse.json(existingResult);
      } else {
        await addUserToContent(contentHash, userId);
        return NextResponse.json({ ...existingResult, message: 'User associated with existing content' });
      }
    }

    await storeContentVerificationAndUser(verificationResult, userId);
    console.log('Verification result and user stored in database');

    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error('Error in content verification:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}