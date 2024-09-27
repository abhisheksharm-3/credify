import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { ensureNeo4jInitialized } from '@/lib/server/neo4jhelpers';
import { getCachedDetectionStatus, setCachedDetectionStatus } from '@/lib/serverUtils/cache';
import { processForgeryDetection } from '@/lib/serverUtils/forgeryDetection';
import { handleApiError } from '@/lib/serverUtils/errorHandler';
import { ValidationError } from '@/lib/errors';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await rateLimit(request);
    await ensureNeo4jInitialized();

    const contentId = params.id;
    if (!contentId) {
      throw new ValidationError('Content ID is required');
    }

    let detectionStatus = await getCachedDetectionStatus(contentId);

    if (!detectionStatus) {
      detectionStatus = { status: 'pending', message: 'Forgery detection started' };
      await setCachedDetectionStatus(contentId, detectionStatus);
      
      // Process forgery detection asynchronously
      processForgeryDetection(contentId).then(async (result) => {
        await setCachedDetectionStatus(contentId, result);
      }).catch(logger.error);
    }

    return NextResponse.json(detectionStatus);

  } catch (error) {
    return handleApiError(error);
  }
}