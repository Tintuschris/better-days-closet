import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * API Route: Set Supabase Session Server-Side
 * 
 * Purpose: Bridge client-side auth tokens to server-side cookies
 * Use Case: Magic links, invites, signup confirmations, email changes
 * 
 * This ensures that after client-side session establishment,
 * the server-side rendering immediately recognizes the user as authenticated.
 * 
 * Pattern: Reusable across all Supabase + Next.js App Router projects
 */
export async function POST(request) {
  try {
    const { access_token, refresh_token } = await request.json()
    
    // Validate required tokens
    if (!access_token || !refresh_token) {
      console.error('Missing tokens in set-session request')
      return NextResponse.json(
        { error: 'Missing access_token or refresh_token' },
        { status: 400 }
      )
    }
    
    // Create server-side Supabase client with cookies
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    // Set session server-side (this sets the auth cookies)
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })
    
    if (error) {
      console.error('Failed to set session server-side:', error)
      return NextResponse.json(
        { error: 'Failed to establish session', details: error.message },
        { status: 401 }
      )
    }
    
    // Verify the session was established
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('Session set but no user found')
      return NextResponse.json(
        { error: 'Session established but user verification failed' },
        { status: 401 }
      )
    }
    
    console.log('Server-side session established for user:', user.email)
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at
      }
    })
    
  } catch (error) {
    console.error('Set session API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
