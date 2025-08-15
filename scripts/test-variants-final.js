// Final test of product_variants table structure
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFinalStructure() {
  console.log('🧪 Final test of product_variants structure...\n');

  // Get a product ID
  const { data: products } = await supabase
    .from('products')
    .select('id, price')
    .limit(1);

  const testProductId = products[0].id;
  const productPrice = parseFloat(products[0].price);
  
  console.log(`Using product ID ${testProductId} with price ${productPrice}...\n`);

  // Test with required price field
  const testData = {
    product_id: testProductId,
    size: 'M',
    color: 'Red',
    price: productPrice,
    quantity: 10,
    sku: 'TEST-SKU-001'
  };

  console.log(`🔍 Testing with data: ${JSON.stringify(testData)}`);
  
  const { data, error } = await supabase
    .from('product_variants')
    .insert(testData)
    .select();

  if (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.details) {
      console.log(`Details: ${error.details}`);
    }
  } else {
    console.log(`✅ Success! Created variant:`);
    console.log(JSON.stringify(data[0], null, 2));
    
    // Clean up
    await supabase
      .from('product_variants')
      .delete()
      .eq('id', data[0].id);
    console.log(`🧹 Cleaned up test record`);
  }
}

testFinalStructure()
  .then(() => {
    console.log('\n✅ Final testing completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Testing failed:', error);
    process.exit(1);
  });
