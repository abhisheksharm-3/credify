import {  UploadThingError } from "uploadthing/server";
import { ourFileRouter } from "../../uploadthing/core";
import { getLoggedInUser } from "@/lib/server/appwrite";
import { NextRequest } from "next/server";
import { UTApi } from "uploadthing/server";
import { UploadedFileType } from "@/lib/types";
  const utapi = new UTApi();

const auth = async (req: NextRequest) => {
  try {
    const user = await getLoggedInUser();
    return user ? { id: user.$id } : null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};

export const GET = async (request: NextRequest) => {
  try {
    const user = await auth(request);

    if (!user) throw new UploadThingError("Unauthorized");

    const userId = user.id;
    const { files, hasMore } = await utapi.listFiles();
    const userFiles = files.filter((file: UploadedFileType) => file.customId === userId);

    return new Response(JSON.stringify({ files: userFiles, hasMore }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response(JSON.stringify({ message: "Error fetching files" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};