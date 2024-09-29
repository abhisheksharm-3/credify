import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server/appwrite';
import { Databases, ID, Query } from 'node-appwrite';
import { UTApi } from 'uploadthing/server';
import { z } from 'zod';
import logger from '@/lib/logger';

const deleteRequestSchema = z.object({
  id: z.string().nonempty('ID is required'),
});

const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const APPWRITE_COLLECTION_ID = process.env.APPWRITE_COLLECTION_ID!;

class DeleteError extends Error {
  constructor(service: string, id: string, originalError: unknown) {
    super(`Failed to delete ${service} with ID: ${id}`);
    this.name = 'DeleteError';
    this.cause = originalError;
  }
}

async function getFileDocument(databases: Databases, id: string) {
  try {
    return await databases.getDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, id);
  } catch (error) {
    const documents = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_COLLECTION_ID,
      [Query.equal('fileId', id)]
    );

    if (documents.documents.length > 0) {
      return documents.documents[0];
    }
    return null;
  }
}

async function deleteUploadThingFile(utapi: UTApi, fileId: string) {
  try {
    await utapi.deleteFiles(fileId);
    logger.info(`File deleted from UploadThing: ${fileId}`);
    return true;
  } catch (error) {
    logger.warn(`Failed to delete UploadThing file: ${fileId}`, error);
    return false;
  }
}

async function deleteAppwriteDocument(databases: Databases, documentId: string) {
  try {
    await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, documentId);
    logger.info(`Document deleted from Appwrite: ${documentId}`);
    return true;
  } catch (error) {
    logger.warn(`Failed to delete Appwrite document: ${documentId}`, error);
    return false;
  }
}

export async function DELETE(req: Request) {
  const utapi = new UTApi();
  
  try {
    const { id } = deleteRequestSchema.parse(await req.json());
    logger.info(`Attempting to delete content with ID: ${id}`);

    const { account } = await createAdminClient();
    const databases = new Databases(account.client);

    const file = await getFileDocument(databases, id);
    
    let uploadThingDeleted = false;
    let appwriteDeleted = false;

    // Always attempt to delete from UploadThing
    uploadThingDeleted = await deleteUploadThingFile(utapi, id);

    // If file exists in Appwrite, attempt to delete it
    if (file) {
      logger.info(`File found in Appwrite: ${JSON.stringify(file)}`);
      appwriteDeleted = await deleteAppwriteDocument(databases, file.$id);
      
      // If file.fileId is different from id, try deleting that as well from UploadThing
      if (file.fileId && file.fileId !== id) {
        await deleteUploadThingFile(utapi, file.fileId);
      }
    } else {
      logger.info(`No file found in Appwrite with ID: ${id}`);
    }

    if (uploadThingDeleted || appwriteDeleted) {
      return NextResponse.json({ 
        message: 'Deletion attempted', 
        uploadThingDeleted, 
        appwriteDeleted 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        error: 'File not found in either UploadThing or Appwrite' 
      }, { status: 404 });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    logger.error('Unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}