import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server/appwrite';
import { Databases, ID, Query } from 'node-appwrite';
import { UTApi } from 'uploadthing/server';

export async function DELETE(req: Request) {
  const utapi = new UTApi()
  try {
    const { id } = await req.json();
    console.log('Deleting content with ID:', id);

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Create an admin client
    const { account } = await createAdminClient();
    const client = account.client;

    // Create a Databases instance
    const databases = new Databases(client);

    console.log('Fetching document...');
    // 1. Try to get the file information from Appwrite
    let file;
    try {
      // First, try to fetch the document assuming 'id' is the document ID
      file = await databases.getDocument(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_COLLECTION_ID!,
        id
      );
    } catch (error) {
      // If that fails, assume 'id' is the fileId and query for it
      const documents = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_COLLECTION_ID!,
        [Query.equal('fileId', id)]
      );

      if (documents.documents.length > 0) {
        file = documents.documents[0];
      } else {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
    }

    console.log('File retrieved:', file);

    // 2. Delete the file from UploadThing
    const uploadThingFileKey = file.fileId;
    if (uploadThingFileKey) {
      console.log('Deleting file from UploadThing:', uploadThingFileKey);
      await utapi.deleteFiles(uploadThingFileKey);
    }

    // 3. Delete the file record from Appwrite
    console.log('Deleting document from Appwrite');
    await databases.deleteDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_COLLECTION_ID!,
      file.$id
    );

    return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting file:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}