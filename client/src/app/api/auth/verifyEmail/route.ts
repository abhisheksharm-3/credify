import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/server/appwrite';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  if (userId && secret) {
    try {
      const result = await verifyEmail(userId, secret);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ success: false, error: 'Invalid query parameters' }, { status: 400 });
  }
}