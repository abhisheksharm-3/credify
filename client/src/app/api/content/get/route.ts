import { UploadThingError } from "uploadthing/server";
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

    if (!user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const userId = user.id;
    let filesResponse;
    
    try {
      filesResponse = await utapi.listFiles();
    } catch (error) {
      console.error("Error calling utapi.listFiles():", error);
      return new Response(JSON.stringify({ message: "Error fetching files from UploadThing" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!filesResponse || !Array.isArray(filesResponse.files)) {
      return new Response(JSON.stringify({ message: "Invalid response from UploadThing", files: [], hasMore: false }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const { files, hasMore } = filesResponse;
    
    const userFiles = files.filter((file: UploadedFileType) => file.customId === userId);

    return new Response(JSON.stringify({ files: userFiles, hasMore }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response(JSON.stringify({ message: "Error processing request" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};