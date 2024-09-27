// @/lib/errorHandler.ts

import { NextResponse } from 'next/server';
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ExternalServiceError
} from '@/lib/errors';
import logger from '@/lib/logger';

export function handleApiError(error: unknown): NextResponse {
  logger.error('API Error:', error);

  const errorResponse = {
    error: error instanceof Error ? error.message : 'Internal server error',
    status: error instanceof ValidationError ? 400 :
            error instanceof AuthenticationError ? 401 :
            error instanceof AuthorizationError ? 403 :
            error instanceof RateLimitError ? 429 :
            error instanceof ExternalServiceError ? 502 : 500
  };

  return NextResponse.json(errorResponse, { status: errorResponse.status });
}