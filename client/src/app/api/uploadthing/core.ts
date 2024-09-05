import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getLoggedInUser, createAdminClient } from "@/lib/server/appwrite";
import { Databases, ID } from "node-appwrite";

const f = createUploadthing();

const auth = async (req: Request) => {
  console.log("Starting auth function");
  try {
    const user = await getLoggedInUser();
    console.log("Auth result:", user ? "User authenticated" : "User not authenticated");
    return user ? { id: user.$id } : null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};

export const ourFileRouter = {
  contentUploader: f({
    video: { maxFileSize: "128MB" },
    image: { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      console.log("Starting middleware function for contentUploader");
      const user = await auth(req);
      if (!user) {
        console.log("Middleware: User not authenticated, throwing Unauthorized error");
        throw new UploadThingError("Unauthorized");
      }
      console.log("Middleware: User authenticated, userId:", user.id);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File details:", { key: file.key, name: file.name, size: file.size, type: file.type });
      
      // Store file information in Appwrite
      console.log("Creating Appwrite admin client");
      const { account } = await createAdminClient();
      const databases = new Databases(account.client);
      
      try {
        console.log("Storing file information in Appwrite");
        const docId = ID.unique();
        await databases.createDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_COLLECTION_ID!,
          docId,
          {
            userId: metadata.userId,
            fileId: file.key,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileUrl: file.url,
          }
        );
        console.log("File information stored successfully. Document ID:", docId);
      } catch (error) {
        console.error("Error storing file information in Appwrite:", error);
      }

      console.log("Returning upload result");
      return { 
        uploadedBy: metadata.userId,
        fileId: file.key,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      };
    }),

  // New endpoint: analyzeContent (without authentication)
  analyzeContent: f({
    video: { maxFileSize: "128MB" },
    image: { maxFileSize: "16MB" },
  })
    .middleware(async () => {
      console.log("Starting middleware function for analyzeContent");
      // No authentication check here
      return { userId: "anonymous" };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete for analysis");
      console.log("File details:", { key: file.key, name: file.name, size: file.size, type: file.type });
      
      // Here you would typically call your content analysis service
      // For this example, we'll just return the file details
      console.log("Returning analysis result");
      return { 
        fileId: file.key,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;