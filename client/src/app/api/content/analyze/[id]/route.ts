import { NextRequest, NextResponse } from 'next/server';
import fetch, { Response } from 'node-fetch';
import FormData from 'form-data';
import { initializeNeo4j, getContentVerificationAndUser, ensureNeo4jConnection, VerificationResult, getContentVerificationOnly } from '@/lib/server/neo4jhelpers';
import { getLoggedInUser } from '@/lib/server/appwrite';

export const dynamic = 'force-dynamic';

const VERIFICATION_SERVICE_BASE_URL = 'https://credify-ndpx.onrender.com';

async function downloadContent(url: string): Promise<{ buffer: Buffer; contentType: string }> {
    console.log(`[downloadContent] Attempting to download content from URL: ${url}`);
    try {
        const response: Response = await fetch(url);
        if (!response.ok) {
            console.error(`[downloadContent] Failed to download content: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to download content: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        console.log(`[downloadContent] Content type: ${contentType}`);
        const buffer = await response.buffer();
        console.log(`[downloadContent] Content downloaded successfully. Buffer size: ${buffer.length} bytes`);
        return { buffer, contentType };
    } catch (error) {
        console.error('[downloadContent] Error downloading content:', error);
        throw new Error('Failed to download content');
    }
}

async function getContentHash(contentBuffer: Buffer, contentType: string, filename: string): Promise<string> {
    console.log(`[getContentHash] Preparing to get content hash for file: ${filename}, Content-Type: ${contentType}`);
    const formData = new FormData();
    const isImage = contentType.startsWith('image');
    const endpoint = isImage ? 'verify_image' : 'verify_video';
    const fileAttributeName = isImage ? 'image_file' : 'video_file';

    formData.append(fileAttributeName, contentBuffer, {
        filename,
        contentType,
    });

    console.log(`[getContentHash] Sending request to ${VERIFICATION_SERVICE_BASE_URL}/${endpoint}`);
    try {
        const response: Response = await fetch(`${VERIFICATION_SERVICE_BASE_URL}/${endpoint}`, {
            method: 'POST',
            body: formData as any,
            headers: formData.getHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[getContentHash] Verification service error: ${errorText}`);
            throw new Error(`Verification service error: ${errorText}`);
        }

        const result: VerificationResult = await response.json() as VerificationResult;
        console.log(`[getContentHash] Verification service response:`, result);
        const hash = result.image_hash || result.video_hash;
        if (!hash) {
            console.error('[getContentHash] No hash returned from verification service');
            throw new Error('No hash returned from verification service');
        }
        console.log(`[getContentHash] Content hash obtained: ${hash}`);
        return hash;
    } catch (error) {
        console.error('[getContentHash] Error getting content hash:', error);
        throw new Error('Failed to get content hash');
    }
}

let isNeo4jInitialized = false;

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    const contentId = params.id;
    console.log('[GET] Received request to /api/content/analyze for content ID:', contentId);

    if (!contentId) {
        console.error('[GET] Content ID is missing');
        return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    try {
        if (!isNeo4jInitialized) {
            console.log('[GET] Initializing Neo4j...');
            await initializeNeo4j();
            isNeo4jInitialized = true;
            console.log('[GET] Neo4j initialized successfully');
        }
        ensureNeo4jConnection();
        console.log('[GET] Neo4j connection ensured');

        const contentUrl = `https://utfs.io/f/${contentId}`;
        console.log('[GET] Content URL:', contentUrl);

        let contentBuffer: Buffer;
        let contentType: string;
        try {
            console.log('[GET] Downloading content...');
            ({ buffer: contentBuffer, contentType } = await downloadContent(contentUrl));
            console.log('[GET] Content downloaded successfully. Content type:', contentType);
        } catch (error) {
            console.error('[GET] Error downloading content:', error);
            return NextResponse.json({ error: 'Failed to download content' }, { status: 500 });
        }

        const filename = `content_${contentId}.${contentType.split('/')[1]}`;

        let contentHash: string;
        try {
            console.log('[GET] Getting content hash from verification service...');
            contentHash = await getContentHash(contentBuffer, contentType, filename);
            console.log('[GET] Content hash:', contentHash);
        } catch (error) {
            console.error('[GET] Error getting content hash:', error);
            return NextResponse.json({ error: 'Failed to get content hash' }, { status: 500 });
        }

        try {
            console.log('[GET] Querying database for content verification and user...');
            const { verificationResult: existingResult, uploadInfo } = await getContentVerificationOnly(contentHash);
            console.log('[GET] Database query result:', existingResult);

            if (existingResult) {
                console.log('[GET] Hash found in database:', existingResult);
                return NextResponse.json({
                    contentHash,
                    status: 'found',
                    message: 'Content hash found in database',
                    verificationResult: existingResult,
                    creatorsId: uploadInfo
                });
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid contentHash or userId provided')) {
                console.log('[GET] Content hash not found in database');
            } else {
                console.error('[GET] Unexpected error during database query:', error);
                return NextResponse.json({ error: 'Unexpected error during database query' }, { status: 500 });
            }
        }

        // If we reach here, it means the content was not found
        console.log('[GET] Content hash not found in database');
        return NextResponse.json({
            contentHash,
            status: 'not_found',
            message: 'Content hash not found in database'
        });

    } catch (error) {
        console.error('[GET] Unhandled error in content verification:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}