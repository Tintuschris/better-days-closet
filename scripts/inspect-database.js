// Database inspection script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectDatabase() {
  console.log('🔍 Inspecting Better Days Closet Database Structure...\n');

  // Direct approach - inspect known tables from the codebase
  console.log('🔄 Inspecting known tables from codebase analysis...\n');

  const knownTables = [
    'products',
    'product_variants',
    'categories',
    'cart',
    'wishlist',
    'orders',
    'users',
    'delivery_addresses',
    'marketing_banners'
  ];

  console.log('📋 Tables to inspect:');
  knownTables.forEach(table => {
    console.log(`  - ${table}`);
  });
  console.log('');

  for (const tableName of knownTables) {
    await inspectTable(tableName);
  }
}

async function inspectTable(tableName) {
  console.log(`📊 Table: ${tableName}`);
  console.log('─'.repeat(50));

  try {
    // Get table structure by fetching one row
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`  ❌ Error accessing table: ${error.message}\n`);
      return;
    }

    if (data && data.length > 0) {
      const sampleRow = data[0];
      console.log('  📝 Columns and sample data:');
      
      Object.entries(sampleRow).forEach(([column, value]) => {
        const type = typeof value;
        const displayValue = value === null ? 'NULL' : 
                           type === 'string' && value.length > 50 ? 
                           `"${value.substring(0, 50)}..."` : 
                           JSON.stringify(value);
        
        console.log(`    ${column}: ${type} = ${displayValue}`);
      });
    } else {
      console.log('  📝 Table exists but is empty');
    }

    // Get row count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`  📊 Total rows: ${count}`);
    }

  } catch (error) {
    console.log(`  ❌ Error inspecting table: ${error.message}`);
  }

  console.log('');
}

// Run the inspection
inspectDatabase()
  .then(() => {
    console.log('✅ Database inspection completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database inspection failed:', error);
    process.exit(1);
  });
