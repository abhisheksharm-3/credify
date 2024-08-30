import { Driver, Session } from 'neo4j-driver';
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

export async function initializeNeo4j() {
    if (driver) {
      return; // Connection already initialized
    }
  
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;
  
    if (!uri || !user || !password) {
      throw new Error('Neo4j environment variables are not set');
    }
  
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
  }
  
  export async function getSession(): Promise<Session> {
    if (!driver) {
      await initializeNeo4j();
    }
    return driver!.session();
  }
  
  export async function runQuery(cypher: string, params: Record<string, any>) {
    const session = await getSession();
    try {
      return await session.run(cypher, params);
    } finally {
      await session.close();
    }
  }

export async function getContentVerificationAndUser(contentId: string, userId: string): Promise<{ verificationResult: VerificationResult | null, userExists: boolean }> {
  const result = await runQuery(
    `
    MATCH (c:Content {contentId: $contentId})
    OPTIONAL MATCH (u:User {userId: $userId})-[:UPLOADED]->(c)
    RETURN c.verificationResult AS verificationResult, u.userId AS userId
    `,
    { contentId, userId }
  );
  const record = result.records[0];
  return {
    verificationResult: record?.get('verificationResult') ? JSON.parse(record.get('verificationResult')) : null,
    userExists: record?.get('userId') !== null
  };
}

export async function getUploaderHierarchy(contentId: string): Promise<User | null> {
  const result = await runQuery(
    `
    MATCH (c:Content {contentId: $contentId})
    MATCH p=(u:User)-[:UPLOADED*]->(c)
    WITH COLLECT(p) AS paths
    CALL apoc.convert.toTree(paths) YIELD value
    RETURN value
    `,
    { contentId }
  );

  if (result.records.length === 0) {
    return null;
  }

  const treeResult = result.records[0].get('value');

  // Convert Neo4j tree result to our User interface
  function convertToUserHierarchy(node: any): User {
    return {
      userId: node.userId,
      children: (node.uploaded || []).map((child: any) => convertToUserHierarchy(child))
    };
  }

  return convertToUserHierarchy(treeResult);
}

export async function storeContentVerificationAndUser(contentId: string, verificationResult: VerificationResult, userId: string) {
  await runQuery(
    `
    MERGE (u:User {userId: $userId})
    MERGE (c:Content {contentId: $contentId})
    SET c.verificationResult = $verificationResult
    MERGE (u)-[:UPLOADED]->(c)
    `,
    { userId, contentId, verificationResult: JSON.stringify(verificationResult) }
  );
}

export async function addUserToContent(contentId: string, userId: string) {
  await runQuery(
    `
    MATCH (c:Content {contentId: $contentId})
    MERGE (u:User {userId: $userId})
    MERGE (u)-[:UPLOADED]->(c)
    `,
    { userId, contentId }
  );
}

export async function closeNeo4jConnection() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

export function ensureNeo4jConnection() {
  if (!driver) {
    throw new Error('Neo4j connection not initialized. Call initializeNeo4j() first.');
  }
}