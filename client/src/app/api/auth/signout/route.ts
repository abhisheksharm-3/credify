import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/server/appwrite';

export async function POST(req: NextRequest) {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession('current');
    return NextResponse.json({ message: 'Signed out successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error signing out' }, { status: 500 });
  }
}

export const runtime = "edge"