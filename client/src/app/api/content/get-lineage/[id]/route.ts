import { NextRequest, NextResponse } from 'next/server';
import { initializeNeo4j, getConnectedUsers } from '@/lib/server/neo4jhelpers';
import { getUserById } from '@/lib/server/appwrite';
import  logger  from '@/lib/logger';
import { z } from 'zod';

const ParamsSchema = z.object({
  id: z.string().nonempty('Content ID is required'),
});

interface UserNode {
  userId: string;
  name: string;
  children: UserNode[];
}

async function fetchUserDetails(userId: string): Promise<UserNode> {
  try {
    const result = await getUserById(userId);
    return {
      userId,
      name: result.success ? result.user?.name ?? 'Unknown User' : 'Unknown User',
      children: [],
    };
  } catch (error) {
    logger.error(`Error fetching user details for ${userId}:`, error);
    return { userId, name: 'Unknown User', children: [] };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = ParamsSchema.parse(params);

    logger.info(`Fetching connected users for content ID: ${id}`);

    await initializeNeo4j();
    
    const { content, users } = await getConnectedUsers(id);

    if (!content) {
      logger.warn(`Content not found for ID: ${id}`);
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const verificationResult = content.verificationResult 
      ? JSON.parse(content.verificationResult) 
      : null;

    const userDetails = await Promise.all(users.map(user => fetchUserDetails(user.userId)));

    const uploaderHierarchy = userDetails.length > 0 
      ? { ...userDetails[0], children: userDetails.slice(1) } 
      : null;

    logger.info(`Successfully fetched data for content ID: ${id}`);

    return NextResponse.json({ verificationResult, uploaderHierarchy });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error:', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    logger.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}