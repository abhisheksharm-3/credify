"use server";

import { createAdminClient } from "@/lib/server/appwrite";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";

export async function signUpWithGoogle() {
  const { account } = await createAdminClient();

  try {
    const origin = headers().get("origin");
    if (!origin) {
      throw new Error("Origin header not found");
    }

    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Google,
      `${origin}/api/auth/oauth`,
      `${origin}/signup`
    );

    return redirect(redirectUrl);
  } catch (error) {
    console.error("Error in signUpWithGoogle:", error);
    throw error;
  }
}