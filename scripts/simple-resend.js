#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const email = process.argv[2] || 'betterdayscloset@gmail.com';

console.log(`🔄 Resending confirmation for: ${email}`);

const { error } = await supabase.auth.resend({
  type: 'signup',
  email: email,
  options: {
    emailRedirectTo: 'https://www.betterdayscloset.com/auth/callback'
  }
});

if (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

console.log('✅ Confirmation email sent successfully!');
console.log('📧 Check the inbox for:', email);
