#!/usr/bin/env node

/**
 * Script to generate a new confirmation link for a specific user
 * Usage: node scripts/generate-confirmation-link.js <email>
 * Example: node scripts/generate-confirmation-link.js betterdayscloset@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function generateConfirmationLink(email) {
  try {
    console.log(`🔄 Generating confirmation link for: ${email}`);

    // First check if user exists using RPC or direct query
    const { data: users, error: queryError } = await supabase.rpc('get_user_by_email', { user_email: email });

    if (queryError) {
      // Fallback: try to generate link directly
      console.log('⚠️ Could not query user directly, attempting to generate link...');
    } else if (!users || users.length === 0) {
      console.error('❌ User not found with email:', email);
      return false;
    } else {
      const user = users[0];
      if (user.email_confirmed_at) {
        console.log('✅ User email is already confirmed!');
        console.log(`   Confirmed at: ${user.email_confirmed_at}`);
        return true;
      }
    }
    }

    console.log('🔄 Attempting to resend confirmation email...');

    // Try using the resend method first (simpler and more reliable)
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: 'https://www.betterdayscloset.com/auth/callback'
      }
    });

    if (resendError) {
      console.log('⚠️ Resend method failed, trying admin generateLink...');

      // Fallback: try admin generateLink
      const { data, error: generateError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: email,
        options: {
          redirectTo: 'https://www.betterdayscloset.com/auth/callback'
        }
      });

      if (generateError) {
        console.error('❌ Error generating confirmation link:', generateError.message);
        return false;
      }

      console.log('✅ Confirmation link generated successfully!');
      console.log('📧 Email will be sent automatically to:', email);
      if (data?.properties?.action_link) {
        console.log('🔗 Manual confirmation link (if needed):');
        console.log('   ', data.properties.action_link);
      }
    } else {
      console.log('✅ Confirmation email sent successfully!');
      console.log('📧 Check the inbox for:', email);
    }

    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.error('Usage: node scripts/generate-confirmation-link.js <email>');
  console.error('Example: node scripts/generate-confirmation-link.js betterdayscloset@gmail.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Invalid email format');
  process.exit(1);
}

// Run the script
generateConfirmationLink(email)
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
