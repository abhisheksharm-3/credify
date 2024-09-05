import { NextRequest, NextResponse } from 'next/server';
import fetch, { Response } from 'node-fetch';
import FormData from 'form-data';
import { initializeNeo4j, getContentVerificationAndUser, ensureNeo4jConnection, VerificationResult } from '@/lib/server/neo4jhelpers';
import { getLoggedInUser } from '@/lib/server/appwrite';

export const dynamic = 'force-dynamic';

const VERIFICATION_SERVICE_BASE_URL = 'https://credify-ndpx.onrender.com';

async function downloadContent(url: string): Promise<{ buffer: Buffer; contentType: string }> {
    try {
        const response: Response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download content: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const buffer = await response.buffer();
        return { buffer, contentType };
    } catch (error) {
        console.error('Error downloading content:', error);
        throw new Error('Failed to download content');
    }
}

async function getContentHash(contentBuffer: Buffer, contentType: string, filename: string): Promise<string> {
    const formData = new FormData();
    const isImage = contentType.startsWith('image');
    const endpoint = isImage ? 'verify_image' : 'verify_video';
    const fileAttributeName = isImage ? 'image_file' : 'video_file';

    formData.append(fileAttributeName, contentBuffer, {
        filename,
        contentType,
    });

    try {
        const response: Response = await fetch(`${VERIFICATION_SERVICE_BASE_URL}/${endpoint}`, {
            method: 'POST',
            body: formData as any,
            headers: formData.getHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Verification service error: ${errorText}`);
        }

        const result: VerificationResult = await response.json() as VerificationResult;
        const hash = result.image_hash || result.video_hash;
        if (!hash) {
            throw new Error('No hash returned from verification service');
        }
        return hash;
    } catch (error) {
        console.error('Error getting content hash:', error);
        throw new Error('Failed to get content hash');
    }
}

let isNeo4jInitialized = false;

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    const contentId = params.id;
    console.log('Received request to /api/content/analyze for content ID:', contentId);

    if (!contentId) {
        return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    try {
        if (!isNeo4jInitialized) {
            await initializeNeo4j();
            isNeo4jInitialized = true;
        }
        ensureNeo4jConnection();

        const contentUrl = `https://utfs.io/f/${contentId}`;
        console.log('Content URL:', contentUrl);

        let contentBuffer: Buffer;
        let contentType: string;
        try {
            console.log('Downloading content...');
            ({ buffer: contentBuffer, contentType } = await downloadContent(contentUrl));
            console.log('Content downloaded successfully. Content type:', contentType);
        } catch (error) {
            console.error('Error downloading content:', error);
            return NextResponse.json({ error: 'Failed to download content' }, { status: 500 });
        }

        const filename = `content_${contentId}.${contentType.split('/')[1]}`;

        let contentHash: string;
        try {
            console.log('Getting content hash from verification service...');
            contentHash = await getContentHash(contentBuffer, contentType, filename);
            console.log('Content hash:', contentHash);
        } catch (error) {
            console.error('Error getting content hash:', error);
            return NextResponse.json({ error: 'Failed to get content hash' }, { status: 500 });
        }

        try {
            const { verificationResult: existingResult, userExists } = await getContentVerificationAndUser(contentHash, "");

            if (existingResult) {
                console.log('Hash found in database:', existingResult);
                return NextResponse.json({
                    contentHash,
                    status: 'found',
                    message: 'Content hash found in database',
                    verificationResult: existingResult
                });
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid contentHash or userId provided')) {
                console.log('Content hash not found in database');
            } else {
                console.error('Unexpected error during database query:', error);
                return NextResponse.json({ error: 'Unexpected error during database query' }, { status: 500 });
            }
        }

        // If we reach here, it means the content was not found
        return NextResponse.json({
            contentHash,
            status: 'not_found',
            message: 'Content hash not found in database'
        });

    } catch (error) {
        console.error('Unhandled error in content verification:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}