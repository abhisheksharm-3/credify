import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/appwrite";
import { Databases, Query, Models } from "node-appwrite";
import logger from "@/lib/logger";

interface FileDocument extends Models.Document {
  userId: string;
  verified: boolean;
}

async function fetchFiles(databases: Databases, userId: string, collectionId: string, verified: boolean): Promise<FileDocument[]> {
  try {
    const response = await databases.listDocuments<FileDocument>(
      process.env.APPWRITE_DATABASE_ID!,
      collectionId,
      [
        Query.equal("userId", userId),
        Query.orderDesc('$createdAt'),
      ]
    );
    return response.documents.map(doc => ({ ...doc, verified }));
  } catch (error) {
    logger.error(`Error fetching ${verified ? 'verified' : 'unverified'} files:`, error);
    throw new Error(`Failed to fetch ${verified ? 'verified' : 'unverified'} files`);
  }
}

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    console.log(userId);
    if (!userId) {
      logger.warn("Missing userId in request");
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    logger.info(`Fetching files for user: ${userId}`);
    
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);

    const [unverifiedFiles, verifiedFiles] = await Promise.all([
      fetchFiles(databases, userId, process.env.APPWRITE_COLLECTION_ID!, false),
      fetchFiles(databases, userId, process.env.APPWRITE_VERIFIED_CONTENT_COLLECTION_ID!, true)
    ]);

    const combinedFiles = [...unverifiedFiles, ...verifiedFiles]
      .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());

    const totalFiles = unverifiedFiles.length + verifiedFiles.length;

    logger.info(`Successfully fetched ${totalFiles} files for user: ${userId}`);

    return NextResponse.json({ files: combinedFiles }, { status: 200 });
  } catch (error) {
    logger.error("Error processing request:", error);
    return NextResponse.json({ message: "Error processing request" }, { status: 500 });
  }
};
