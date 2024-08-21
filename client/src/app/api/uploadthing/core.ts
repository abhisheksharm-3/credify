import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getLoggedInUser } from "@/lib/server/appwrite";

const f = createUploadthing();

// Custom auth function using the provided getLoggedInUser function
const auth = async (req: Request) => {
  try {
    const user = await getLoggedInUser();
    return user ? { id: user.$id } : null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  contentUploader: f({
    video: { maxFileSize: "128MB" },
    image: { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await auth(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      console.log("file name", file.name);
      console.log("file size", file.size);
      console.log("file type", file.type);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { 
        uploadedBy: metadata.userId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;