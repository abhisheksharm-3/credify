import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getLoggedInUser, createAdminClient } from "@/lib/server/appwrite";
import { Databases, ID } from "node-appwrite";
import logger from "@/lib/logger";

const f = createUploadthing();

const MAX_VIDEO_SIZE = "1024MB";
const MAX_IMAGE_SIZE = "128MB";

interface User {
  id: string;
}

async function auth(req: Request): Promise<User | null> {
  try {
    const user = await getLoggedInUser();
    if (user) {
      logger.info(`User authenticated: ${user.$id}`);
      return { id: user.$id };
    }
    logger.info("User not authenticated");
    return null;
  } catch (error) {
    logger.error('Error authenticating user:', error);
    return null;
  }
}

async function storeFileInformation(databases: Databases, userId: string, file: any): Promise<string> {
  const docId = ID.unique();
  logger.info(`Storing file information for user: ${userId}, docId: ${docId}`);
  try {
    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_COLLECTION_ID!,
      docId,
      {
        userId,
        fileId: file.key,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: file.url,
      }
    );
    logger.info(`File information stored successfully. User: ${userId}, Document ID: ${docId}`);
    return docId;
  } catch (error) {
    logger.error(`Error storing file information. User: ${userId}, Document ID: ${docId}`, error);
    throw new Error("Failed to store file information");
  }
}

const handleUploadComplete = async ({ metadata, file }: { metadata: { userId: string }, file: any }) => {
  logger.info(`Upload complete for userId: ${metadata.userId}`);
  logger.info(`File details: key=${file.key}, name=${file.name}, size=${file.size}, type=${file.type}`);
  
  try {
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);
    
    const docId = await storeFileInformation(databases, metadata.userId, file);

    return { 
      uploadedBy: metadata.userId,
      fileId: file.key,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      docId: docId
    };
  } catch (error) {
    logger.error(`Error in onUploadComplete for user: ${metadata.userId}:`, error);
    throw new UploadThingError("Failed to process upload");
  }
};

export const ourFileRouter = {
  contentUploader: f({
    video: { maxFileSize: MAX_VIDEO_SIZE },
    image: { maxFileSize: MAX_IMAGE_SIZE },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(handleUploadComplete),

  analyzeContent: f({
    video: { maxFileSize: MAX_VIDEO_SIZE },
    image: { maxFileSize: MAX_IMAGE_SIZE },
  })
    .middleware(() => ({ userId: "anonymous" }))
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info("Upload complete for analysis (anonymous user)");
      logger.info(`File details: key=${file.key}, name=${file.name}, size=${file.size}, type=${file.type}`);
      
      return { 
        fileId: file.key,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;