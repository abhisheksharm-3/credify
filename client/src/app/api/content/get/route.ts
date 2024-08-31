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
    
    const files = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_COLLECTION_ID!,
      [
        Query.equal("userId", userId),
        Query.orderDesc('$createdAt')  // Changed from orderAsc to orderDesc
      ]
    );

    return new Response(JSON.stringify({ files: files.documents, hasMore: files.total > files.documents.length }), {
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