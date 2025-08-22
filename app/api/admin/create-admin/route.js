import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This should only be used once to create the initial admin account
// After that, admin accounts should be created through the admin panel
export async function POST(request) {
  return NextResponse.json(
    {
      error: 'Service role key not configured. Please set up admin account manually.',
      instructions: [
        '1. Go to Supabase Dashboard → Authentication → Users',
        '2. Create user with email: betterdayscloset@gmail.com',
        '3. After creation, run this SQL in Supabase SQL Editor:',
        'UPDATE users SET role = \'admin\' WHERE email = \'betterdayscloset@gmail.com\';',
        '4. Then you can login with the admin credentials'
      ]
    },
    { status: 501 }
  );
}

// Optional: GET endpoint to check if admin exists
export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if admin user exists in public.users table
    const { data: adminUser, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
      .eq('email', 'betterdayscloset@gmail.com')
      .eq('role', 'admin')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      adminExists: !!adminUser,
      admin: adminUser || null
    });

  } catch (error) {
    console.error('Error checking admin user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
