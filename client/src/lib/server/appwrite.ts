"use server";
import { Client, Account, ID, Users, Databases, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { HashQueryResult } from "../frontend-types";

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!);

  const session = cookies().get("credify-session");
  if (!session || !session.value) {
    throw new Error("No session");
  }
  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
  };
}
export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch (error) {
    return null;
  }
}
export async function signUpWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const name = `${firstName} ${lastName}`.trim();
  const { account } = await createAdminClient();

  try {
    await account.create(ID.unique(), email, password, name);
    const session = await account.createEmailPasswordSession(email, password);
    cookies().set("credify-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    return { success: true };
  } catch (error) {
    console.error("Sign up failed:", error);
    return { success: false, error: "Sign up failed. Please try again." };
  }
}

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailPasswordSession(email, password);
    cookies().set("credify-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    return { success: true };
  } catch (error) {
    console.error("Login failed:", error);
    return { success: false, error: "Invalid email or password" };
  }
}

export async function updatePassword(oldPassword: string, newPassword: string) {
  try {
    const { account } = await createSessionClient();
    await account.updatePassword(newPassword, oldPassword);
    return { success: true };
  } catch (error) {
    console.error("Password update failed:", error);
    return { success: false, error: "Password update failed. Please try again." };
  }
}

export async function getLogDetails() {
  try {
    const { account } = await createSessionClient();
    const logResponse = await account.listLogs(
      []
    );
    // Format the logs
    const formattedLogs = logResponse.logs.map((log) => {
      return {
        event: log.event,
        user: log.userName || log.userEmail,
        deviceName: log.deviceName || '',
        deviceBrand: log.deviceBrand || '',
        deviceModel: log.deviceModel || '',
        osName: log.osName || '',
        osVersion: log.osVersion || '',
        timestamp: new Date(log.time).toLocaleString(), // Convert timestamp to readable format
      };
    });

    const latestLogs = formattedLogs.slice(-5);
    return { success: true, logs: latestLogs };
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return { success: false, error: "Failed to fetch logs. Please try again." };
  }
}
export async function updatePhoneNumber(phone: string, password: string) {
  try {
    const { account } = await createSessionClient();
    const result = await account.updatePhone(
      phone,
      password
    );
    console.log(result);
    
    return { success: true };
  } catch (error) {
    console.error("Phone number update failed:", error);
    return { success: false, error: "Phone number update failed. Please try again." };
  }
}
export async function getUserById(userId: string) {
  try {
    const { users } = await createAdminClient();
    const user = await users.get(userId);
    return { success: true, user };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return { success: false, error: "Failed to fetch user. Please try again." };
  }
}

export async function sendVerificationEmail() {
  try {
    const { account } = await createSessionClient();
    await account.createVerification(`${process.env.DEPLOYMENT_ADDRESS!}/verifyEmail`);
    return { success: true, message: "Verification email sent." };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error: "Failed to send verification email." };
  }
}

export async function verifyEmail(userId: string, secret: string) {
  try {
    console.log(userId, secret);
    const { account } = await createSessionClient();
    await account.updateVerification(userId, secret);
    return { success: true, message: "Email successfully verified." };
  } catch (error) {
    console.error("Email verification failed:", error);
    return { success: false, error: "Email verification failed." };
  }
}

export async function checkVerify() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    if (user.emailVerification) {
      return { success: true, verified: true, message: "Email is already verified." };
    } else {
      return { success: true, verified: false, message: "Email is not verified." };
    }
  } catch (error) {
    console.error("Failed to check email verification status:", error);
    return { success: false, error: "Failed to check email verification status." };
  }
}

export async function setProfilePhoto(userId: string, profileURL: string) {
  try {
    const { users } = await createAdminClient();
    const user = await users.get(userId);  // Fetch current user preferences
    const currentPrefs = user.prefs || {};  // Get existing preferences or empty object
    await users.updatePrefs(userId, { ...currentPrefs, profilePhoto: profileURL });  // Merge new data with existing prefs
    return { success: true, message: "Profile photo updated." };
  } catch (error) {
    console.error("Failed to update profile photo:", error);
    return { success: false, error: "Failed to update profile photo." };
  }
}

export async function setIdPhoto(userId: string, IdUrl: string) {
  try {
    const { users } = await createAdminClient();
    const user = await users.get(userId);
    const currentPrefs = user.prefs || {};
    await users.updatePrefs(userId, { ...currentPrefs, IdPhoto: IdUrl });
    return { success: true, message: "ID photo updated." };
  } catch (error) {
    console.error("Failed to update ID photo:", error);
    return { success: false, error: "Failed to update ID photo." };
  }
}
export async function setUserAsVerified() {
  try {
    const { users } = await createAdminClient();
    const { account } = await createSessionClient();
    const user = await account.get();
    await users.updateLabels(user.$id, [...(user.labels || []), 'verified']);
    return { success: true, message: "User set as verified." };
  } catch (error) {
    console.error("Failed to set user as verified:", error);
    return { success: false, error: "Failed to set user as verified." };
  }
}

export async function getFileUploadDateByHash(hash: string, userId: string): Promise<string | undefined> {
  const { account } = await createAdminClient();
  const databases = new Databases(account.client);
  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_VERIFIED_CONTENT_COLLECTION_ID!,
      [
        Query.equal('userId', userId),
        Query.or([
          Query.equal('image_hash', hash),
          Query.equal('video_hash', hash)
        ])
      ]
    );
    if (response.documents.length > 0) {
      const file = response.documents[0];
      return file.verificationDate;
    } else {
      return undefined;
    }
  } catch (error) {
    throw error;
  }
}


export async function getDocumentsByHash(hash: string): Promise<HashQueryResult> {
  try {
    console.log("called hash function with hash", hash);
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);
    console.log("called hash function with hash", hash);
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_VERIFIED_CONTENT_COLLECTION_ID!,
      [
        Query.or([
          Query.equal('image_hash', hash),
          Query.equal('video_hash', hash)
        ])
      ]
    );

    return {
      success: true,
      documents: response.documents
    };
  } catch (error) {
    console.error("Failed to fetch documents by hash:", error);
    return {
      success: false,
      error: "Failed to fetch documents. Please try again."
    };
  }
}

export async function createCopyrightDocument(userId: string, mediaHash: string) {
  try {
    console.log("called hash function with hash", userId, mediaHash);
    
    // Use the client and admin properties from createAdminClient
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);  // Use the client from account

    const response = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.COPYRIGHT_COLLECTION_ID!,
      ID.unique(),
      {
        copyrightOwnerId: userId,
        mediaHash: mediaHash,
      }
    );

    return { success: true, document: response };

  } catch (error) {
    console.error("Error issuing certificate:", error);
    return { success: false, error: "Error issuing certificate" };
  }
}
export async function updateIsDisputeByHash(hash: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Checking for document with mediaHash:", hash);
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);

    // Step 1: Find the document by mediaHash
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.COPYRIGHT_COLLECTION_ID!,
      [
        Query.equal('mediaHash', hash),  // Directly comparing with mediaHash
      ]
    );

    if (response.documents.length === 0) {
      return { success: false, error: "No document found with the specified mediaHash." };
    }

    // Step 2: Update the first document's isDispute property to true
    const documentId = response.documents[0].$id; // Get the ID of the first document found

    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.COPYRIGHT_COLLECTION_ID!,
      documentId,
      {
        isDisputed: true, // Set isDispute to true
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to update isDispute:", error);
    return { success: false, error: "Failed to update isDispute. Please try again." };
  }
}

export async function fetchUserInfoByHash(hash: string): Promise<{ success: boolean; userId?: string; user?: any; error?: string }> {
  try {
    console.log("Checking for document with mediaHash:", hash);
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);

    // Step 1: Find the document by mediaHash
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.COPYRIGHT_COLLECTION_ID!,
      [
        Query.equal('mediaHash', hash), // Directly comparing with mediaHash
      ]
    );

    if (response.documents.length === 0) {
      return { success: false, error: "No document found with the specified mediaHash." };
    }

    // Step 2: Extract userId and userName from the found document
    const document = response.documents[0]; // Get the first document found
    const userId = document.copyrightOwnerId; // Assuming userId is a field in the document
    const user = await getUserById(userId); // Await the getUserById call

    return { success: true, userId, user }; // Return user instead of userName
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return { success: false, error: "Failed to fetch user info. Please try again." };
  }
}

export async function compareHashes(hashToCompare: string, fileType: 'image' | 'video') {
  try {
    const { account } = await createAdminClient();
    const databases = new Databases(account.client);
    // Fetch all hashes from the copyright collection
    const copyrightDocs = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.COPYRIGHT_COLLECTION_ID!
    );

    const hashArray = copyrightDocs.documents.map(doc => doc.mediaHash);

    // Prepare the payload for the backend service
    const payload = {
      hash_to_compare: hashToCompare,
      hash_array: hashArray,
      file_type: fileType
    };

    // Make a POST request to the backend service
    const response = await fetch(`${process.env.VERIFICATION_SERVICE_BASE_URL}/compare_hashes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to compare hashes');
    }

    const result = await response.json();

    return {
      success: true,
      data: {
        message: result.message,
        results: result.results,
        matching_hash: result.matching_hash
      },
    };
  } catch (error) {
    console.error('Error comparing hashes:', error);
    return {
      success: false,
      error: 'Failed to compare hashes',
    };
  }
}
