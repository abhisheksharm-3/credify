import { NextRequest } from "next/server";
import { getLoggedInUser, createAdminClient } from "@/lib/server/appwrite";
import { Databases, Query } from "node-appwrite";

export const GET = async (request: NextRequest) => {
  try {
    const user = await getLoggedInUser();

    if (!user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = user.$id;
    
    // Fetch files from Appwrite
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);

    // Fetch unverified files
    const unverifiedFiles = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_COLLECTION_ID!,
      [
        Query.equal("userId", userId),
        Query.orderDesc('$createdAt') 
      ]
    );

    // Fetch verified files
    const verifiedFiles = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_VERIFIED_CONTENT_COLLECTION_ID!,
      [
        Query.equal("userId", userId),
        Query.orderDesc('$createdAt') 
      ]
    );

    // Combine and tag the files
    const combinedFiles = [
      ...unverifiedFiles.documents.map(file => ({ ...file, verified: false })),
      ...verifiedFiles.documents.map(file => ({ ...file, verified: true }))
    ];

    // Sort combined files by creation date
    combinedFiles.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());

    const totalFiles = unverifiedFiles.total + verifiedFiles.total;
    const hasMore = totalFiles > combinedFiles.length;

    return new Response(JSON.stringify({ files: combinedFiles, hasMore }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response(JSON.stringify({ message: "Error processing request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};