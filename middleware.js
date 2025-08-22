import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Only run auth checks for profile and admin routes
  if (!pathname.startsWith('/profile') && !pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  // If there's an error or no user, redirect to login
  if (error || !user) {
    console.log('Middleware: No user found, redirecting to login')
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // For admin routes, check if user has admin role
  if (pathname.startsWith('/admin')) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, email')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        console.log('Middleware: User not found in database, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (userData.role !== 'admin') {
        console.log(`Middleware: User ${userData.email} is not admin (role: ${userData.role}), redirecting to home`);
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log(`Middleware: Admin user ${userData.email} accessing admin panel`);
    } catch (err) {
      console.log('Middleware: Error checking user role, redirecting to home', err);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  console.log('Middleware: User authenticated, allowing access to', pathname)

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match profile and admin routes specifically
     * Exclude static files and API routes
     */
    '/profile/:path*',
    '/admin/:path*'
  ],
}
