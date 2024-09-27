// @/lib/cache.ts

import NodeCache from 'node-cache';
import { ForgeryDetectionResult } from '@/lib/types';

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

export async function getCachedDetectionStatus(contentId: string): Promise<ForgeryDetectionResult | undefined> {
  const cacheKey = `forgery_detection:${contentId}`;
  return cache.get<ForgeryDetectionResult>(cacheKey);
}

export async function setCachedDetectionStatus(contentId: string, status: ForgeryDetectionResult): Promise<void> {
  const cacheKey = `forgery_detection:${contentId}`;
  cache.set(cacheKey, status);
}