import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function GET() {
  try {
    const session = cookies().get("credify-session");
    if (session) {
      return NextResponse.json({ isLoggedIn: true });
    } else {
      return NextResponse.json({ isLoggedIn: false });
    }
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({ isLoggedIn: false });
  }
}