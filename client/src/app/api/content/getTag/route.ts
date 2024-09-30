import { NextRequest, NextResponse } from 'next/server';
import { initializeNeo4j } from '@/lib/server/neo4jhelpers';
import { getLoggedInUser } from '@/lib/server/appwrite';
import { VerificationStatus } from '@/lib/types';
import NodeCache from 'node-cache';
import { processVerification } from '@/services/verificationService';

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
      processVerification(contentId, userId, cache).catch(console.error);
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