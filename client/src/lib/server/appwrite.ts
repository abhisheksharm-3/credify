// src/lib/server/appwrite.js
"use server";
import { Client, Account, ID } from "node-appwrite";
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