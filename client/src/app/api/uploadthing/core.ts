import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UTFiles, UploadThingError } from "uploadthing/server";
import { getLoggedInUser } from "@/lib/server/appwrite";
import * as z from "zod";

// Define constants for file size limits
const MAX_VIDEO_SIZE = "128MB";
const MAX_IMAGE_SIZE = "16MB";

// Define a schema for file metadata
const FileMetadataSchema = z.object({
  userId: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
});

type FileMetadata = z.infer<typeof FileMetadataSchema>;

const f = createUploadthing({
  errorFormatter: (err) => ({
    message: err.message,
    zodError: err.cause instanceof z.ZodError ? err.cause.flatten() : null,
  }),
});

// Improved auth function with better error handling
const auth = async (req: Request): Promise<{ id: string } | null> => {
  try {
    const user = await getLoggedInUser();
    return user ? { id: user.$id } : null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw new UploadThingError("Authentication failed");
  }
};

// Helper function to validate and process file metadata
const processFileMetadata = (
  userId: string,
  file: { name: string; type: string; size: number }
): FileMetadata => {
  try {
    return FileMetadataSchema.parse({
      userId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Error processing file metadata:', error);
    throw new UploadThingError("Invalid file metadata");
  }
};

export const ourFileRouter = {
  contentUploader: f({
    video: { maxFileSize: MAX_VIDEO_SIZE },
    image: { maxFileSize: MAX_IMAGE_SIZE },
  })
    .middleware(async ({ req, files }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");

      const fileOverrides = files.map((file) => ({
        ...file,
        customId: user.id,
      }));

      return { userId: user.id, [UTFiles]: fileOverrides };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Upload complete for userId:", metadata.userId);
        console.log("File details:", {
          url: file.url,
          name: file.name,
          size: file.size,
          type: file.type,
        });

        return processFileMetadata(metadata.userId, file);
      } catch (error) {
        console.error('Error in onUploadComplete:', error);
        throw new UploadThingError("Failed to process upload");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;