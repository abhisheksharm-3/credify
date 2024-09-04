// src/lib/server/appwrite.js
"use server";
import { Client, Account, ID, Users, Databases } from "node-appwrite";
import { cookies } from "next/headers";

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

    // Attempt to update the password directly
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
    // Fetch the logs
    const logResponse = await account.listLogs(
      [] // queries (optional)
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

    // Slice to get only the latest 5 results
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
      phone, // phone
      password // password
    );
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


export async function createProfileDocument(userId:any, profileId:string, imageUrl:string) {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.PROFILE_COLLECTION!)
      .setKey(process.env.APPWRITE_KEY!);

    const databases = new Databases(client);

    const result = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID!, // Database ID
      process.env.APPWRITE_COLLECTION_ID!, // Collection ID
      ID.unique(), // Generate a unique Document ID
      { userId, profileId, imageUrl } // Document data
    );

    return { success: true, result };
  } catch (error) {
    console.error("Failed to create profile document:", error);
    return { success: false, error: "Failed to create profile document. Please try again." };
  }
}
