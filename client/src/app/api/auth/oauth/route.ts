
import { createAdminClient } from "@/lib/server/appwrite";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
    return NextResponse.json({ error: "Missing userId or secret" }, { status: 400 });
  }

  const { account } = await createAdminClient();
  const session = await account.createSession(userId, secret);

  const cookieStore = cookies();
  cookieStore.set("credify-session", session.secret, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  return NextResponse.redirect(`${request.nextUrl.origin}/user/dashboard`);
}