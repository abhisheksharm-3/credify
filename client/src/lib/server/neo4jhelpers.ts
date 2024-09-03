import { Driver, Session, Result } from 'neo4j-driver';
import neo4j from 'neo4j-driver';

let driver: Driver | null = null;

export interface VerificationResult {
  video_hash?: string;
  collective_audio_hash?: string;
  image_hash?: string;
  audio_hash?: string;
  frame_hash?: string;
  is_tampered?: boolean;
}

export interface User {
  userId: string;
  children: User[];
}

export class Neo4jConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Neo4jConnectionError';
  }
}

export class ContentVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentVerificationError';
  }
}

export async function initializeNeo4j(): Promise<void> {
  if (driver) {
    return; // Connection already initialized
  }

  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    throw new Neo4jConnectionError('Neo4j environment variables are not set');
  }

  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 30000,
    });

    // Test the connection
    const session = driver.session();
    try {
      await session.run('RETURN 1');
      console.log('Successfully connected to Neo4j');
    } finally {
      await session.close();
    }
  } catch (error) {
    throw new Neo4jConnectionError(`Failed to connect to Neo4j: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getSession(): Promise<Session> {
  if (!driver) {
    await initializeNeo4j();
  }
  if (!driver) {
    throw new Neo4jConnectionError('Failed to initialize Neo4j driver');
  }
  return driver.session();
}

export async function runQuery(cypher: string, params: Record<string, any>): Promise<Result> {
  const session = await getSession();
  try {
    return await session.run(cypher, params);
  } catch (error) {
    throw new Neo4jConnectionError(`Failed to run query: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await session.close();
  }
}

export async function storeContentVerificationAndUser(verificationResult: VerificationResult, userId: string): Promise<void> {
  const contentHash = verificationResult.image_hash || verificationResult.video_hash;
  
  if (!contentHash) {
    throw new ContentVerificationError('No image_hash or video_hash found in verificationResult');
  }

  if (!userId) {
    throw new ContentVerificationError('Invalid userId provided');
  }

  try {
    await runQuery(
      `
      MERGE (c:Content {contentHash: $contentHash})
      SET c.verificationResult = $verificationResult
      MERGE (u:User {userId: $userId})
      MERGE (u)-[r:UPLOADED]->(c)
      SET u.lastUploadContentHash = $contentHash
      `,
      { 
        userId, 
        contentHash,
        verificationResult: JSON.stringify(verificationResult) 
      }
    );
  } catch (error) {
    throw new ContentVerificationError(`Failed to store content verification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getContentVerificationAndUser(contentHash: string, userId: string): Promise<{ verificationResult: VerificationResult | null, userExists: boolean, uploadInfo: { userId: string } | null }> {
  if (!contentHash || !userId) {
    throw new ContentVerificationError('Invalid contentHash or userId provided');
  }

  try {
    const result = await runQuery(
      `
      MATCH (c:Content {contentHash: $contentHash})
      OPTIONAL MATCH (u:User {userId: $userId})-[r:UPLOADED]->(c)
      RETURN c.verificationResult AS verificationResult, u.userId AS userId
      `,
      { contentHash, userId }
    );
    const record = result.records[0];
    return {
      verificationResult: record?.get('verificationResult') ? JSON.parse(record.get('verificationResult')) : null,
      userExists: record?.get('userId') !== null,
      uploadInfo: record?.get('userId') ? { userId: record.get('userId') } : null
    };
  } catch (error) {
    throw new ContentVerificationError(`Failed to get content verification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getContentUploaders(contentHash: string): Promise<Array<{ userId: string }>> {
  if (!contentHash) {
    throw new ContentVerificationError('Invalid contentHash provided');
  }

  try {
    const result = await runQuery(
      `
      MATCH (u:User)-[r:UPLOADED]->(c:Content {contentHash: $contentHash})
      RETURN u.userId AS userId
      ORDER BY r.createdAt ASC
      `,
      { contentHash }
    );

    return result.records.map(record => ({
      userId: record.get('userId')
    }));
  } catch (error) {
    throw new ContentVerificationError(`Failed to get content uploaders: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function convertToUserHierarchy(node: any): User {
  return {
    userId: node.userId,
    children: (node.uploaded || [])
      .map((child: any) => convertToUserHierarchy(child))
      .sort((a: User, b: User) => a.userId.localeCompare(b.userId))
  };
}

export async function getUploaderHierarchy(contentHash: string): Promise<User | null> {
  if (!contentHash) {
    throw new ContentVerificationError('Invalid contentHash provided');
  }

  try {
    const result = await runQuery(
      `
      MATCH (c:Content {contentHash: $contentHash})
      MATCH p=(u:User)-[r:UPLOADED*]->(c)
      WITH COLLECT(p) AS paths
      CALL apoc.convert.toTree(paths) YIELD value
      RETURN value
      `,
      { contentHash }
    );

    if (result.records.length === 0) {
      return null;
    }

    const treeResult = result.records[0].get('value');
    console.log(treeResult)

    return convertToUserHierarchy(treeResult);
  } catch (error) {
    throw new ContentVerificationError(`Failed to get uploader hierarchy: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function addUserToContent(contentHash: string, userId: string): Promise<void> {
  if (!contentHash || !userId) {
    throw new ContentVerificationError('Invalid contentHash or userId provided');
  }

  try {
    await runQuery(
      `
      MATCH (c:Content {contentHash: $contentHash})
      MERGE (u:User {userId: $userId})
      MERGE (u)-[r:UPLOADED]->(c)
      SET u.lastUploadContentHash = $contentHash
      `,
      { userId, contentHash }
    );
  } catch (error) {
    throw new ContentVerificationError(`Failed to add user to content: ${error instanceof Error ? error.message : String(error)}`);
  }
}
export async function getConnectedUsers(contentHash: string): Promise<{ content: any, users: User[] }> {
  if (!contentHash) {
    throw new ContentVerificationError('Invalid contentHash provided');
  }

  try {
    const result = await runQuery(
      `
      MATCH (c:Content)
      WHERE c.contentHash = $contentHash OR c.image_hash = $contentHash
      MATCH (u:User)-[:UPLOADED]->(c)
      RETURN c, COLLECT(u) as connectedUsers
      `,
      { contentHash }
    );

    if (result.records.length === 0) {
      return { content: null, users: [] };
    }

    const record = result.records[0];
    const content = record.get('c').properties;
    const users = record.get('connectedUsers').map((user: any) => ({
      userId: user.properties.userId,
      children: []
    }));

    return { content, users };
  } catch (error) {
    throw new ContentVerificationError(`Failed to get connected users: ${error instanceof Error ? error.message : String(error)}`);
  }
}
export async function closeNeo4jConnection(): Promise<void> {
  if (driver) {
    try {
      await driver.close();
      driver = null;
      console.log('Neo4j connection closed successfully');
    } catch (error) {
      throw new Neo4jConnectionError(`Failed to close Neo4j connection: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export function ensureNeo4jConnection(): void {
  if (!driver) {
    throw new Neo4jConnectionError('Neo4j connection not initialized. Call initializeNeo4j() first.');
  }
}