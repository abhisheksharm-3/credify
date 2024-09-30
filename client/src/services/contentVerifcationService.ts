import { Response } from 'node-fetch';
import NodeCache from 'node-cache';
import { ContentInfo, VerificationResultType } from '@/lib/types';

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export async function verifyContent({ contentUrl, endpoint }: ContentInfo, geminiAnalysis: string): Promise<VerificationResultType> {
  const cacheKey = `verificationResult:${contentUrl}`;
  const cachedResult = cache.get<VerificationResultType>(cacheKey);
  if (cachedResult) {
    console.log(`[verifyContent] Cache hit for URL: ${contentUrl}`);
    return cachedResult;
  }

  console.log(`[verifyContent] Verifying content at URL: ${contentUrl}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${process.env.VERIFICATION_SERVICE_BASE_URL}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({ url: contentUrl }),
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[verifyContent] Verification service error: ${errorText}`);
      throw new Error(`Verification service error: ${errorText}`);
    }

    const apiResponse = await response.json() as { message: string; result: VerificationResultType };
    cache.set(cacheKey, apiResponse.result);
    console.log(`[verifyContent] Content verified successfully and cached`);
    return apiResponse.result;
  } catch (error) {
    console.error(`[verifyContent] Error during content verification: ${error}`);
    throw error;
  }
}