import NodeCache from 'node-cache';

interface ContentInfo {
  contentUrl: string;
  contentType: string;
  filename: string;
  endpoint: string;
}

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const extractFilename = (contentDisposition: string | null): string => {
  if (!contentDisposition) return 'unknown';

  // Try to match filename="example.jpg" or filename*=UTF-8''example.jpg
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  const matches = filenameRegex.exec(contentDisposition);
  
  if (matches && matches[1]) {
    // Remove quotes and decode URI component if needed
    let filename = matches[1].replace(/['"]/g, '');
    try {
      return decodeURIComponent(filename);
    } catch {
      return filename;
    }
  }

  return 'unknown';
};
export async function getContentInfo(contentId: string): Promise<ContentInfo> {
  const cacheKey = `contentInfo:${contentId}`;
  const cachedInfo = cache.get<ContentInfo>(cacheKey);
  if (cachedInfo) {
    console.log(`[getContentInfo] Cache hit for contentId: ${contentId}`);
    return cachedInfo;
  }

  console.log(`[getContentInfo] Fetching content info for contentId: ${contentId}`);
  const contentUrl = `https://utfs.io/f/${contentId}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000);

    const contentTypeResponse = await fetch(contentUrl, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!contentTypeResponse.ok) {
      throw new Error(`Failed to fetch content type: ${contentTypeResponse.statusText}`);
    }
    const contentType: string = contentTypeResponse.headers.get('content-type') || 'application/octet-stream';
    const filename = extractFilename(contentTypeResponse.headers.get('content-disposition'));
    const endpoint = contentType.startsWith('image/') ? 'verify_image' : 'fingerprint';

    const contentInfo: ContentInfo = { contentUrl, contentType, filename, endpoint };
    cache.set(cacheKey, contentInfo);
    console.log(`[getContentInfo] Content info retrieved and cached: ${JSON.stringify(contentInfo)}`);
    return contentInfo;
  } catch (error) {
    console.error(`[getContentInfo] Error fetching content info: ${error}`);
    throw error;
  }
}