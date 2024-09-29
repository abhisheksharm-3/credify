import { NextRequest, NextResponse } from 'next/server';
import NodeCache from 'node-cache';
import { rateLimit } from '@/lib/rateLimit';
import logger from '@/lib/logger';
import { RateLimitError, ValidationError, getErrorStatus } from '@/lib/errors';
import { AnalysisStatus } from '@/lib/types';
import { processAnalysis } from '@/services/analysisProcessorService';
import { ensureNeo4jInitialized } from '@/lib/server/neo4jhelpers';

export const dynamic = 'force-dynamic';

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      throw new RateLimitError('Rate limit exceeded');
    }

    const contentId = params.id;
    if (!contentId) {
      throw new ValidationError('Content ID is required');
    }

    await ensureNeo4jInitialized();

    const cacheKey = `analysis:${contentId}`;
    let analysisStatus = cache.get<AnalysisStatus>(cacheKey);

    if (!analysisStatus) {
      analysisStatus = { status: 'pending', message: 'Analysis started' };
      cache.set(cacheKey, analysisStatus);
      
      processAnalysis(contentId).then(result => {
        cache.set(cacheKey, result);
      }).catch(logger.error);
    }

    return NextResponse.json(analysisStatus);

  } catch (error) {
    logger.error('Error in content analysis:', error);
    const errorResponse = {
      error: error instanceof Error ? error.message : 'Internal server error',
      status: getErrorStatus(error)
    };
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}