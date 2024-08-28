import { NextResponse } from 'next/server';
import { initializeNeo4j, getContentVerificationAndUser, getUploaderHierarchy } from '@/lib/server/neo4jhelpers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    await initializeNeo4j();
    
    const [{ verificationResult }, uploaderHierarchy] = await Promise.all([
      getContentVerificationAndUser(id, "initialUserId"),
      getUploaderHierarchy(id)
    ]);

    return NextResponse.json({ verificationResult, uploaderHierarchy });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
  // Remove the closeNeo4jConnection() call from here
}