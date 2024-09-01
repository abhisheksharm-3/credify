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
  uploadTimestamp: number;
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
      ON CREATE SET r.timestamp = timestamp()
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

export async function getContentVerificationAndUser(contentHash: string, userId: string): Promise<{ verificationResult: VerificationResult | null, userExists: boolean }> {
  if (!contentHash || !userId) {
    throw new ContentVerificationError('Invalid contentHash or userId provided');
  }

  try {
    const result = await runQuery(
      `
      MATCH (c:Content {contentHash: $contentHash})
      OPTIONAL MATCH (u:User {userId: $userId})-[:UPLOADED]->(c)
      RETURN c.verificationResult AS verificationResult, u.userId AS userId
      `,
      { contentHash, userId }
    );
    const record = result.records[0];
    return {
      verificationResult: record?.get('verificationResult') ? JSON.parse(record.get('verificationResult')) : null,
      userExists: record?.get('userId') !== null
    };
  } catch (error) {
    throw new ContentVerificationError(`Failed to get content verification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getContentUploaders(contentHash: string): Promise<string[]> {
  if (!contentHash) {
    throw new ContentVerificationError('Invalid contentHash provided');
  }

  try {
    const result = await runQuery(
      `
      MATCH (u:User)-[:UPLOADED]->(c:Content {contentHash: $contentHash})
      RETURN COLLECT(u.userId) AS uploaders
      `,
      { contentHash }
    );

    return result.records[0]?.get('uploaders') || [];
  } catch (error) {
    throw new ContentVerificationError(`Failed to get content uploaders: ${error instanceof Error ? error.message : String(error)}`);
  }
}
function convertToUserHierarchy(node: any): User {
  return {
    userId: node.userId,
    uploadTimestamp: node.uploaded?.[0]?.timestamp?.toNumber() || 0,
    children: (node.uploaded || [])
      .map((child: any) => convertToUserHierarchy(child))
      .sort((a: User, b: User) => a.uploadTimestamp - b.uploadTimestamp)
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
      ON CREATE SET r.timestamp = timestamp()
      `,
      { userId, contentHash }
    );
  } catch (error) {
    throw new ContentVerificationError(`Failed to add user to content: ${error instanceof Error ? error.message : String(error)}`);
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