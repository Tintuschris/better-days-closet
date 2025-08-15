import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Check for Supabase auth cookie - Supabase stores session in multiple cookies
  const supabaseSession = req.cookies.get('sb-access-token') || 
                          req.cookies.get('sb:token') || 
                          req.cookies.get('supabase-auth-token');
  
  const { pathname } = req.nextUrl;

  // Protected routes that require authentication
  if (!supabaseSession && (pathname.startsWith('/profile') || pathname.startsWith('/checkout'))) {
    // Store the original URL to redirect back after login
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/profile/:path*',
    '/checkout/:path*'
  ]
};
