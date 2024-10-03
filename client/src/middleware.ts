import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check login status
  const response = await fetch(new URL('/api/auth/status', request.url), {
    headers: {
      'Cookie': request.headers.get('Cookie') || ''
    }
  });
  
  if (response.ok) {
    const { isLoggedIn } = await response.json();
    
    if (!isLoggedIn) {
      // If not logged in, redirect to auth page
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    // If there's an error, redirect to auth page
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If logged in, allow the request to continue
  return NextResponse.next();
}

// Update the matcher to include all routes that should be protected
export const config = {
  matcher: ['/user/:path*', '/content/:path*'],
}