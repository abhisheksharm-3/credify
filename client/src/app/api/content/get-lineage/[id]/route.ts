import { NextResponse } from 'next/server';
import { initializeNeo4j, getConnectedUsers } from '@/lib/server/neo4jhelpers';
import { getUserById } from '@/lib/server/appwrite'; // Assuming this is the correct import path

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    await initializeNeo4j();
    
    const { content, users } = await getConnectedUsers(id);

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const verificationResult = content.verificationResult ? JSON.parse(content.verificationResult) : null;

    // Fetch user details and create a simple hierarchy
    const userDetailsPromises = users.map(async (user) => {
      const result = await getUserById(user.userId);
      return {
        userId: user.userId,
        name: result.success ? result.user?.name ?? 'Unknown User' : 'Unknown User',
        children: []
      };
    });

    const userDetails = await Promise.all(userDetailsPromises);

    // Create a simple hierarchy with the first user as the root
    const uploaderHierarchy = userDetails.length > 0 ? 
      { ...userDetails[0], children: userDetails.slice(1) } : 
      null;

    return NextResponse.json({ verificationResult, uploaderHierarchy });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}