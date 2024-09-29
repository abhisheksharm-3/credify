import { NextRequest, NextResponse } from 'next/server';
import { initializeNeo4j, getConnectedUsers } from '@/lib/server/neo4jhelpers';
import { getUserById, getFileUploadDateByHash } from '@/lib/server/appwrite';
import logger from '@/lib/logger';
import { z } from 'zod';

// Schemas
const ParamsSchema = z.object({
  id: z.string().nonempty('Content ID is required'),
});

// Interfaces
interface UserNode {
  userId: string;
  name: string;
  children: UserNode[];
  dateOfUpload?: string;
}

interface ContentNode {
  contentId: string;
  imageHash?: string;
  videoHash?: string;
}

// Helper functions
const fetchUserDetails = async (userId: string, contentNode: ContentNode): Promise<UserNode> => {
  try {
    const { success, user } = await getUserById(userId);
    const name = success ? user?.name ?? 'Unknown User' : 'Unknown User';
    
    const dateOfUpload = await fetchFileUploadDate(userId, contentNode);

    return {
      userId,
      name,
      children: [],
      dateOfUpload,
    };
  } catch (error) {
    logger.error(`Error fetching user details for ${userId}:`, error);
    return { userId, name: 'Unknown User', children: [] };
  }
};

const fetchFileUploadDate = async (userId: string, contentNode: ContentNode): Promise<string | undefined> => {
  const hash = contentNode.imageHash || contentNode.videoHash;
  if (!hash) return undefined;

  try {
    const uploadDate = await getFileUploadDateByHash(hash, userId);
    return uploadDate;
  } catch (error) {
    logger.error(`Error fetching file upload date for user ${userId} and hash ${hash}:`, error);
    return undefined;
  }
};

const buildUploaderHierarchy = async (users: { userId: string }[], contentNode: ContentNode): Promise<UserNode | null> => {
  const userDetails = await Promise.all(users.map(user => fetchUserDetails(user.userId, contentNode)));
  return userDetails.length > 0 
    ? { ...userDetails[0], children: userDetails.slice(1) } 
    : null;
};

const parseVerificationResult = (result: string | null): any => {
  if (!result) return null;
  try {
    return JSON.parse(result);
  } catch (error) {
    logger.error('Error parsing verification result:', error);
    return null;
  }
};

// Error handler
const handleError = (error: unknown): NextResponse => {
  if (error instanceof z.ZodError) {
    logger.warn('Validation error:', error.errors);
    return NextResponse.json({ error: error.errors }, { status: 400 });
  }

  logger.error("Error fetching data:", error);
  return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
};

// Route handler
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = ParamsSchema.parse(params);
    logger.info(`Fetching connected users for content ID: ${id}`);

    await initializeNeo4j();
    const { content, users } = await getConnectedUsers(id);

    if (!content) {
      logger.warn(`Content not found for ID: ${id}`);
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const contentNode: ContentNode = {
      contentId: id,
      imageHash: content.imageHash,
      videoHash: content.videoHash,
    };

    const [verificationResult, uploaderHierarchy] = await Promise.all([
      parseVerificationResult(content.verificationResult),
      buildUploaderHierarchy(users, contentNode)
    ]);

    logger.info(`Successfully fetched data for content ID: ${id}`);

    return NextResponse.json({ verificationResult, uploaderHierarchy });
  } catch (error) {
    return handleError(error);
  }
}