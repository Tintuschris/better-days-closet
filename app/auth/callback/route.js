import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'
  const type = searchParams.get('type')

  console.log('Callback route - Full URL:', request.url)
  console.log('Callback route - searchParams:', Object.fromEntries(searchParams))
  console.log('Callback route - code:', code, 'error:', error, 'type:', type)
  console.log('Callback route - All headers:', Object.fromEntries(request.headers.entries()))
  console.log('Callback route - Referrer:', request.headers.get('referer'))

  // Handle error cases (expired tokens, access denied, etc.)
  if (error) {
    console.error('Auth callback error:', error, errorDescription)

    if (error === 'access_denied' && errorDescription?.includes('expired')) {
      // Token expired - redirect to request new reset
      return NextResponse.redirect(`${origin}/auth/forgot-password?error=link_expired&message=Your reset link has expired. Please request a new one.`)
    } else if (error === 'access_denied') {
      // Access denied - redirect to login
      return NextResponse.redirect(`${origin}/auth/login?error=access_denied&message=Access was denied or the link is invalid.`)
    } else {
      // Other errors
      return NextResponse.redirect(`${origin}/auth/login?error=${error}&message=${errorDescription || 'Authentication failed'}`)
    }
  }

  if (code) {
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

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
      }

      // Enhanced validation and routing for different auth types
      if (type === 'recovery') {
        // Password reset flow - validate session and redirect with confirmation
        console.log('Password recovery - validating session and redirecting');

        // Verify the session is valid for password recovery
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('Password recovery session invalid');
          return NextResponse.redirect(`${origin}/auth/forgot-password?error=session_invalid&message=Your reset link is invalid. Please request a new one.`);
        }

        console.log('Password recovery session validated for user:', user.email);
        return NextResponse.redirect(`${origin}/auth/reset-password?session_ready=true&user_email=${encodeURIComponent(user.email)}`)
      } else if (type === 'signup') {
        // Email confirmation flow - redirect to profile
        return NextResponse.redirect(`${origin}/profile?confirmed=true`)
      } else if (type === 'invite') {
        // User invite flow
        return NextResponse.redirect(`${origin}/profile?invited=true`)
      } else if (type === 'email_change') {
        // Email change confirmation
        return NextResponse.redirect(`${origin}/profile?email_updated=true`)
      } else {
        // Default - magic link or other auth
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (error) {
      console.error('Auth exchange error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_exchange_error`)
    }
  }

  // If no code and no error in search params, this might be a case where tokens are in the URL fragment
  // We need to handle this on the client side since server can't access URL fragments
  // For password recovery, make this invisible. For other flows, show appropriate UI.

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Processing Authentication - Better Days Closet</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        .spinner {
          border: 2px solid #f3f4f6;
          border-top: 2px solid #8B5CF6;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .hidden { display: none; }
      </style>
    </head>
    <body class="bg-white min-h-screen">
      <!-- Loading UI - Only shown for non-recovery flows -->
      <div id="loading-ui" class="min-h-screen flex items-center justify-center hidden">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl flex items-center justify-center">
            <img src="/logo.png" alt="Better Days Closet" width="48" height="48" class="rounded-xl" />
          </div>
          <div class="flex items-center justify-center mb-4">
            <div class="spinner mr-3"></div>
            <p id="status-text" class="text-gray-600 font-medium">Processing authentication...</p>
          </div>
          <p id="status-detail" class="text-sm text-gray-500">Please wait a moment.</p>
        </div>
      </div>

      <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
      <script>
        // Initialize Supabase
        const supabase = window.supabase.createClient(
          '${process.env.NEXT_PUBLIC_SUPABASE_URL}',
          '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}'
        );
        // Handle authentication and redirect - invisible for password recovery
        async function handleAuthAndRedirect() {
          const maxRetries = 3;
          const retryDelay = 100; // Very fast for invisible processing
          const loadingUI = document.getElementById('loading-ui');
          const statusText = document.getElementById('status-text');
          const statusDetail = document.getElementById('status-detail');

          // Extract tokens from URL fragment first to determine flow type
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);

          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');
          const error = params.get('error');
          const errorCode = params.get('error_code');

          console.log('Callback processing:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            type,
            error,
            errorCode
          });

          // For password recovery, keep UI completely hidden
          // For other flows, show loading UI
          if (type !== 'recovery') {
            loadingUI.classList.remove('hidden');
          } else {
            // For password recovery, ensure body stays blank
            document.body.style.backgroundColor = 'white';
          }

          // Helper function to update status (only for non-recovery flows)
          function updateStatus(text, detail) {
            if (type !== 'recovery') {
              if (statusText) statusText.textContent = text;
              if (statusDetail) statusDetail.textContent = detail;
            }
          }

          try {

            // Handle explicit errors from Supabase with enhanced context
            if (error) {
              console.error('Auth error in fragment:', error, errorCode);

              if (error === 'access_denied' && errorCode === 'otp_expired') {
                if (type === 'recovery') {
                  window.location.replace('/auth/forgot-password?error=link_expired&message=Your reset link has expired. Please request a new one.');
                } else {
                  updateStatus('Link expired', 'Redirecting...');
                  setTimeout(() => {
                    window.location.href = '/auth/forgot-password?error=link_expired&message=Your reset link has expired. Please request a new one.';
                  }, 1500);
                }
              } else {
                if (type === 'recovery') {
                  window.location.replace('/auth/forgot-password?error=invalid_link&message=There was an issue with your reset link. Please request a new one.');
                } else {
                  updateStatus('Invalid link', 'Redirecting...');
                  setTimeout(() => {
                    window.location.href = '/auth/forgot-password?error=invalid_link&message=There was an issue with your reset link. Please request a new one.';
                  }, 1500);
                }
              }
              return;
            }

            // Validate required tokens
            if (!accessToken || !refreshToken) {
              console.error('Missing tokens');

              if (type === 'recovery') {
                window.location.replace('/auth/forgot-password?error=invalid_link&message=Invalid reset link. Please request a new password reset.');
              } else {
                updateStatus('Invalid link', 'Redirecting...');
                setTimeout(() => {
                  window.location.href = '/auth/forgot-password?error=invalid_link&message=Invalid reset link. Please request a new password reset.';
                }, 1500);
              }
              return;
            }

            // Update status for session establishment (only for non-recovery)
            updateStatus('Establishing secure session...', 'Almost ready!');

            // Attempt session establishment with retry logic
            let sessionEstablished = false;
            let lastError = null;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                console.log('Session establishment attempt ' + attempt + '/' + maxRetries + '...');

                const { data, error: sessionError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken
                });

                if (sessionError) {
                  lastError = sessionError;
                  console.warn('Session attempt ' + attempt + ' failed:', sessionError.message);

                  // Check if it's a genuine token expiration (don't retry these)
                  if (sessionError.message?.includes('expired') ||
                      sessionError.message?.includes('invalid') ||
                      sessionError.status === 401) {
                    console.error('Token genuinely expired or invalid');

                    if (type === 'recovery') {
                      window.location.replace('/auth/forgot-password?error=link_expired&message=Your reset link has expired. Please request a new one.');
                    } else {
                      updateStatus('Reset link expired', 'Please request a new password reset.');
                      setTimeout(() => {
                        window.location.href = '/auth/forgot-password?error=link_expired&message=Your reset link has expired. Please request a new one.';
                      }, 1500);
                    }
                    return;
                  }

                  // For other errors, retry after delay (except on last attempt)
                  if (attempt < maxRetries) {
                    if (type !== 'recovery') updateStatus('Retrying connection... (' + attempt + '/' + maxRetries + ')', 'Please wait a moment.');
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                  }
                } else {
                  // Success!
                  console.log('Session established successfully:', data?.user?.email);
                  sessionEstablished = true;
                  break;
                }
              } catch (err) {
                lastError = err;
                console.warn('Session attempt ' + attempt + ' threw error:', err.message);

                // Retry after delay (except on last attempt)
                if (attempt < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, retryDelay));
                  continue;
                }
              }
            }

            if (!sessionEstablished) {
              console.error('Failed to establish session after all retries:', lastError);

              if (type === 'recovery') {
                window.location.replace('/auth/forgot-password?error=session_error&message=Unable to verify your reset link. Please request a new one.');
              } else {
                updateStatus('Connection failed', 'Please request a new reset link.');
                setTimeout(() => {
                  window.location.href = '/auth/forgot-password?error=session_error&message=Unable to verify your reset link. Please request a new one.';
                }, 1500);
              }
              return;
            }

            // Success - validate session and redirect with user context
            console.log('Session established successfully, validating user...');

            if (type === 'recovery') {
              // Password Recovery: Get user info for context and validation
              const { data: { user }, error: userError } = await supabase.auth.getUser();

              if (userError || !user) {
                console.error('Failed to get user after session establishment:', userError);
                window.location.replace('/auth/forgot-password?error=user_error&message=Unable to verify your account. Please request a new reset link.');
                return;
              }

              console.log('Password recovery validated for user:', user.email);
              // Instant redirect with session confirmation and user context
              window.location.replace('/auth/reset-password?session_ready=true&user_email=' + encodeURIComponent(user.email));
            } else {
              // Magic Links, Invites, Signup, Email Change: Set server-side cookies
              console.log('Setting server-side session for auth type:', type);

              try {
                // Call our API to set server-side cookies
                const response = await fetch('/api/auth/set-session', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    access_token: accessToken,
                    refresh_token: refreshToken
                  })
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to set server session');
                }

                const result = await response.json();
                console.log('Server-side session established for user:', result.user.email);

                // Update status for non-recovery flows
                if (type !== 'recovery') {
                  updateStatus('Authentication successful!', 'Redirecting...');
                }

                // Redirect based on auth type
                setTimeout(() => {
                  if (type === 'signup') {
                    window.location.href = '/profile?confirmed=true';
                  } else if (type === 'invite') {
                    window.location.href = '/profile?invited=true';
                  } else if (type === 'email_change') {
                    window.location.href = '/profile?email_updated=true';
                  } else {
                    // Magic link or other - go to home (user will be logged in)
                    window.location.href = '/';
                  }
                }, type !== 'recovery' ? 500 : 0);

              } catch (error) {
                console.error('Failed to set server-side session:', error);
                if (type !== 'recovery') {
                  updateStatus('Authentication failed', 'Please try again.');
                }
                setTimeout(() => {
                  window.location.href = '/auth/login?error=session_error&message=Authentication failed. Please try again.';
                }, 1500);
              }
            }

          } catch (err) {
            console.error('Auth processing error:', err);
            window.location.href = '/auth/forgot-password?error=processing_error&message=Something went wrong. Please try requesting a new reset link.';
          }
        }

        // Start processing immediately
        handleAuthAndRedirect();
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
