import { NextResponse } from 'next/server';
import { supabase } from '../lib/supabase';

export async function middleware(req) {
  const token = req.cookies.get('sb-access-token');  // Supabase's session token
  const { pathname } = req.nextUrl;

  // If user is not logged in and tries to access protected pages
  if (!token && (pathname.startsWith('/profile') || pathname.startsWith('/checkout'))) {
    return NextResponse.redirect(new URL('/auth/login', req.url));  // Redirect to login
  }

  return NextResponse.next();  // Allow request if logged in or accessing unprotected route
}
