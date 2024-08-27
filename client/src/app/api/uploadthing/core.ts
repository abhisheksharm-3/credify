import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getLoggedInUser, createAdminClient } from "@/lib/server/appwrite";
import { Databases, ID } from "node-appwrite";

const f = createUploadthing();

const auth = async (req: Request) => {
  try {
    const user = await getLoggedInUser();
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
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      
      // Store file information in Appwrite
      const { account } = await createAdminClient();
      const databases = new Databases(account.client);
      
      try {
        await databases.createDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_COLLECTION_ID!,
          ID.unique(),
          {
            userId: metadata.userId,
            fileId: file.key,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileUrl: file.url,
          }
        );
      } catch (error) {
        console.error("Error storing file information in Appwrite:", error);
      }

      return { 
        uploadedBy: metadata.userId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;