#!/usr/bin/env node

/**
 * Script to resend confirmation email for a specific user
 * Usage: node scripts/resend-confirmation.js <email>
 * Example: node scripts/resend-confirmation.js betterdayscloset@gmail.com
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

async function resendConfirmationEmail(email) {
  try {
    console.log(`🔄 Resending confirmation email for: ${email}`);
    
    // Use the resend method for signup confirmation
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: 'https://www.betterdayscloset.com/auth/callback'
      }
    });

    if (error) {
      console.error('❌ Error resending confirmation email:', error.message);
      return false;
    }

    console.log('✅ Confirmation email sent successfully!');
    console.log(`📧 Check the inbox for: ${email}`);
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
  console.error('Usage: node scripts/resend-confirmation.js <email>');
  console.error('Example: node scripts/resend-confirmation.js betterdayscloset@gmail.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Invalid email format');
  process.exit(1);
}

// Run the script
resendConfirmationEmail(email)
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
