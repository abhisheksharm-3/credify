import { NextRequest, NextResponse } from 'next/server';
import { initializeNeo4j, getConnectedUsers } from '@/lib/server/neo4jhelpers';
import { getUserById } from '@/lib/server/appwrite';
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
}

// Helper functions
const fetchUserDetails = async (userId: string): Promise<UserNode> => {
  try {
    const { success, user } = await getUserById(userId);
    return {
      userId,
      name: success ? user?.name ?? 'Unknown User' : 'Unknown User',
      children: [],
    };
  } catch (error) {
    logger.error(`Error fetching user details for ${userId}:`, error);
    return { userId, name: 'Unknown User', children: [] };
  }
};

const buildUploaderHierarchy = async (users: { userId: string }[]): Promise<UserNode | null> => {
  const userDetails = await Promise.all(users.map(user => fetchUserDetails(user.userId)));
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

    const [verificationResult, uploaderHierarchy] = await Promise.all([
      parseVerificationResult(content.verificationResult),
      buildUploaderHierarchy(users)
    ]);

    logger.info(`Successfully fetched data for content ID: ${id}`);

    return NextResponse.json({ verificationResult, uploaderHierarchy });
  } catch (error) {
    return handleError(error);
  }
}