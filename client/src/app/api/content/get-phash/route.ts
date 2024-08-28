import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import FormData from 'form-data';

export const dynamic = 'force-dynamic'; // Disable static optimization for this route

export async function POST(req: NextRequest) {
  console.log('Received request to /api/content/get-phash');
  try {
    // Parse the request body
    const body = await req.json();
    const { contentId } = body;
    console.log('Parsed request body:', { contentId });

    if (!contentId) {
      console.log('Error: Missing contentId');
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }
    const contentUrl = `https://utfs.io/f/${contentId}`;
    console.log('Content URL:', contentUrl);

    // Download the content
    console.log('Downloading content...');
    const contentResponse = await fetch(contentUrl);
    if (!contentResponse.ok) {
      console.log('Error downloading content:', contentResponse.status, contentResponse.statusText);
      return NextResponse.json({ error: 'Failed to download content' }, { status: 500 });
    }
    const contentBuffer = await contentResponse.buffer();
    console.log('Content downloaded successfully');

    // Prepare the form data
    console.log('Preparing form data...');
    const formData = new FormData();
    formData.append('video_file', contentBuffer, {
      filename: `content_${contentId}.mp4`,
      contentType: 'video/mp4',
    });
    console.log('Form data prepared');

    // Send the request to the verification service
    console.log('Sending request to verification service...');
    const verificationResponse = await fetch('https://credify-ndpx.onrender.com/verify_video', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    console.log('Verification service response status:', verificationResponse.status);
    if (!verificationResponse.ok) {
      const errorText = await verificationResponse.text();
      console.log('Verification service error:', errorText);
      return NextResponse.json({ error: 'Verification service error', details: errorText }, { status: 500 });
    }

    // Parse and return the verification result
    const verificationResult = await verificationResponse.json();
    console.log('Verification result:', verificationResult);

    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error('Error in pHash verification:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}