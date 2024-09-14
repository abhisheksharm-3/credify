// File: src/lib/rateLimit.ts

import { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10) / 1000, // convert ms to seconds
});

export async function rateLimit(request: NextRequest): Promise<{ success: boolean }> {
  const ip = request.ip ?? '127.0.0.1';
  try {
    await rateLimiter.consume(ip);
    return { success: true };
  } catch {
    return { success: false };
  }
}