import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getLoggedInUser, createAdminClient } from "@/lib/server/appwrite";
import { Databases, ID } from "node-appwrite";
import logger from "@/lib/logger";

const f = createUploadthing();

const MAX_VIDEO_SIZE = "128MB";
const MAX_IMAGE_SIZE = "16MB";

interface User {
  id: string;
}

async function auth(req: Request): Promise<User | null> {
  logger.info("Starting auth function");
  try {
    const user = await getLoggedInUser();
    if (user) {
      logger.info(`User authenticated: ${user.$id}`);
      return { id: user.$id };
    } else {
      logger.info("User not authenticated");
      return null;
    }
  } catch (error) {
    logger.error('Error authenticating user:', error);
    return null;
  }
}

async function storeFileInformation(databases: Databases, userId: string, file: any): Promise<string> {
  const docId = ID.unique();
  logger.info(`Storing file information in Appwrite for user: ${userId}, docId: ${docId}`);
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
    logger.error(`Error storing file information in Appwrite. User: ${userId}, Document ID: ${docId}`, error);
    throw new Error("Failed to store file information");
  }
}

export const ourFileRouter = {
  contentUploader: f({
    video: { maxFileSize: MAX_VIDEO_SIZE },
    image: { maxFileSize: MAX_IMAGE_SIZE },
  })
    .middleware(async ({ req }) => {
      logger.info("Starting middleware function for contentUploader");
      const user = await auth(req);
      if (!user) {
        logger.warn("Middleware: User not authenticated, throwing Unauthorized error");
        throw new UploadThingError("Unauthorized");
      }
      logger.info(`Middleware: User authenticated, userId: ${user.id}`);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info(`Upload complete for userId: ${metadata.userId}`);
      logger.info(`File details: key=${file.key}, name=${file.name}, size=${file.size}, type=${file.type}`);
      
      try {
        logger.info(`Creating Appwrite admin client for user: ${metadata.userId}`);
        const { account } = await createAdminClient();
        const databases = new Databases(account.client);
        
        const docId = await storeFileInformation(databases, metadata.userId, file);

        logger.info(`Returning upload result for user: ${metadata.userId}, docId: ${docId}`);
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
    }),

  analyzeContent: f({
    video: { maxFileSize: MAX_VIDEO_SIZE },
    image: { maxFileSize: MAX_IMAGE_SIZE },
  })
    .middleware(async () => {
      logger.info("Starting middleware function for analyzeContent");
      return { userId: "anonymous" };
    })
    .onUploadComplete(async ({ file }) => {
      logger.info("Upload complete for analysis (anonymous user)");
      logger.info(`File details: key=${file.key}, name=${file.name}, size=${file.size}, type=${file.type}`);
      
      // Here you would typically call your content analysis service
      // For this example, we'll just return the file details
      logger.info("Returning analysis result for anonymous user");
      return { 
        fileId: file.key,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;