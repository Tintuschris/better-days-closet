// Get detailed table schema script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getTableSchema(tableName) {
  console.log(`🔍 Getting schema for table: ${tableName}`);
  console.log('─'.repeat(60));

  try {
    // Try to get column information using a SQL query
    const { data, error } = await supabase.rpc('get_table_columns', { 
      table_name: tableName 
    });

    if (error) {
      console.log('RPC method not available, trying alternative approach...');
      
      // Alternative: Try to insert a dummy record to see what columns are expected
      const { error: insertError } = await supabase
        .from(tableName)
        .insert({});

      if (insertError) {
        console.log('Insert error details:', insertError);
        
        // Parse the error message to extract column information
        if (insertError.message.includes('null value in column')) {
          const match = insertError.message.match(/null value in column "([^"]+)"/);
          if (match) {
            console.log(`Required column found: ${match[1]}`);
          }
        }
      }
    } else {
      console.log('Column information:', data);
    }

  } catch (error) {
    console.error('Error getting schema:', error);
  }
}

// Get schemas for key tables
async function main() {
  console.log('📊 Getting detailed table schemas...\n');
  
  const tables = ['product_variants', 'products', 'categories', 'cart', 'wishlist'];
  
  for (const table of tables) {
    await getTableSchema(table);
    console.log('');
  }
}

main()
  .then(() => {
    console.log('✅ Schema inspection completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Schema inspection failed:', error);
    process.exit(1);
  });
