import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server/appwrite';
import { Databases, ID, Query } from 'node-appwrite';
import { UTApi } from 'uploadthing/server';
import { z } from 'zod';
import logger from '@/lib/logger';

const deleteRequestSchema = z.object({
  id: z.string().nonempty('ID is required'),
});

async function getFileDocument(databases: Databases, id: string) {
  try {
    return await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_COLLECTION_ID!,
      id
    );
  } catch (error) {
    const documents = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_COLLECTION_ID!,
      [Query.equal('fileId', id)]
    );

    if (documents.documents.length > 0) {
      return documents.documents[0];
    }
    throw new Error('File not found');
  }
}

async function deleteUploadThingFile(utapi: UTApi, fileId: string) {
  try {
    await utapi.deleteFiles(fileId);
    logger.info(`File deleted from UploadThing: ${fileId}`);
  } catch (error) {
    logger.error(`Error deleting file from UploadThing: ${fileId}`, error);
    throw new Error('Failed to delete file from UploadThing');
  }
}

async function deleteAppwriteDocument(databases: Databases, documentId: string) {
  try {
    await databases.deleteDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_COLLECTION_ID!,
      documentId
    );
    logger.info(`Document deleted from Appwrite: ${documentId}`);
  } catch (error) {
    logger.error(`Error deleting document from Appwrite: ${documentId}`, error);
    throw new Error('Failed to delete document from Appwrite');
  }
}

export async function DELETE(req: Request) {
  const utapi = new UTApi();
  
  try {
    const body = await req.json();
    const { id } = deleteRequestSchema.parse(body);

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

    if (error instanceof Error) {
      if (error.message === 'File not found') {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      logger.error('Error deleting file', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.error('Unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}