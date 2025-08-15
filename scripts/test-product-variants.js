// Test product_variants table structure
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProductVariants() {
  console.log('🧪 Testing product_variants table structure...\n');

  // First, get a product ID to use for testing
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (productsError || !products || products.length === 0) {
    console.error('Could not get a product ID for testing:', productsError);
    return;
  }

  const testProductId = products[0].id;
  console.log(`Using product ID ${testProductId} for testing...\n`);

  // Test different insert scenarios to understand the schema
  const testCases = [
    {
      name: 'Basic insert with product_id only',
      data: { product_id: testProductId }
    },
    {
      name: 'Insert with size',
      data: { product_id: testProductId, size: 'M' }
    },
    {
      name: 'Insert with color',
      data: { product_id: testProductId, color: 'Red' }
    },
    {
      name: 'Insert with size and color',
      data: { product_id: testProductId, size: 'L', color: 'Blue' }
    },
    {
      name: 'Insert with all possible fields',
      data: { 
        product_id: testProductId, 
        size: 'XL', 
        color: 'Green',
        quantity: 10,
        price_adjustment: 0,
        sku: 'TEST-SKU-001',
        image_url: 'https://example.com/test.jpg',
        is_active: true
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`🔍 Testing: ${testCase.name}`);
    console.log(`   Data: ${JSON.stringify(testCase.data)}`);
    
    const { data, error } = await supabase
      .from('product_variants')
      .insert(testCase.data)
      .select();

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.details) {
        console.log(`   Details: ${error.details}`);
      }
    } else {
      console.log(`   ✅ Success! Inserted variant with ID: ${data[0]?.id}`);
      console.log(`   Returned data: ${JSON.stringify(data[0])}`);
      
      // Clean up - delete the test record
      await supabase
        .from('product_variants')
        .delete()
        .eq('id', data[0].id);
      console.log(`   🧹 Cleaned up test record`);
    }
    console.log('');
  }

  // Try to understand the full schema by examining any existing records
  console.log('🔍 Checking for any existing product_variants...');
  const { data: existingVariants, error: variantsError } = await supabase
    .from('product_variants')
    .select('*')
    .limit(5);

  if (variantsError) {
    console.log(`❌ Error fetching variants: ${variantsError.message}`);
  } else if (existingVariants && existingVariants.length > 0) {
    console.log(`✅ Found ${existingVariants.length} existing variants:`);
    existingVariants.forEach((variant, index) => {
      console.log(`   Variant ${index + 1}:`, JSON.stringify(variant, null, 2));
    });
  } else {
    console.log('📝 No existing variants found (table is empty)');
  }
}

testProductVariants()
  .then(() => {
    console.log('\n✅ Product variants testing completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Testing failed:', error);
    process.exit(1);
  });
