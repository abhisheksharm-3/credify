
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

class FileNotFoundError extends Error {
  constructor(message: string = 'File not found') {
    super(message);
    this.name = 'FileNotFoundError';
  }
}

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
    throw new FileNotFoundError();
  }
}

async function deleteUploadThingFile(utapi: UTApi, fileId: string) {
  try {
    await utapi.deleteFiles(fileId);
    logger.info(`File deleted from UploadThing: ${fileId}`);
  } catch (error) {
    throw new DeleteError('UploadThing file', fileId, error);
  }
}

async function deleteAppwriteDocument(databases: Databases, documentId: string) {
  try {
    await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, documentId);
    logger.info(`Document deleted from Appwrite: ${documentId}`);
  } catch (error) {
    throw new DeleteError('Appwrite document', documentId, error);
  }
}

export async function DELETE(req: Request) {
  const utapi = new UTApi();
  
  try {
    const { id } = deleteRequestSchema.parse(await req.json());
    logger.info(`Deleting content with ID: ${id}`);

    const { account } = await createAdminClient();
    const databases = new Databases(account.client);

    const file = await getFileDocument(databases, id);
    logger.info(`File retrieved: ${JSON.stringify(file)}`);

    if (file.fileId) {
      await deleteUploadThingFile(utapi, file.fileId);
    }

    await deleteAppwriteDocument(databases, file.$id);

    return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    if (error instanceof FileNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof DeleteError) {
      logger.error(error.message, error.cause);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.error('Unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
