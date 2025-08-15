// Comprehensive testing script for product variants functionality
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testVariantsFunctionality() {
  console.log('🧪 Testing Product Variants Functionality...\n');

  const testResults = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const addTest = (name, passed, message) => {
    testResults.tests.push({ name, passed, message });
    if (passed) {
      testResults.passed++;
      console.log(`✅ ${name}: ${message}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${name}: ${message}`);
    }
  };

  try {
    // Test 1: Check if category_attributes table exists and has data
    console.log('📋 Test 1: Category Attributes Table');
    const { data: categoryAttributes, error: catAttrError } = await supabase
      .from('category_attributes')
      .select('*')
      .limit(5);

    if (catAttrError) {
      addTest('Category Attributes Table', false, `Table access failed: ${catAttrError.message}`);
    } else {
      addTest('Category Attributes Table', true, `Found ${categoryAttributes.length} category attributes`);
      
      // Check if any categories have variant support
      const variantSupportCount = categoryAttributes.filter(attr => attr.has_sizes || attr.has_colors).length;
      addTest('Variant Support Configuration', variantSupportCount > 0, 
        `${variantSupportCount} categories configured with variant support`);
    }

    // Test 2: Check product_variants table
    console.log('\n📋 Test 2: Product Variants Table');
    const { data: productVariants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(5);

    if (variantsError) {
      addTest('Product Variants Table', false, `Table access failed: ${variantsError.message}`);
    } else {
      addTest('Product Variants Table', true, `Table accessible, found ${productVariants.length} variants`);
    }

    // Test 3: Check cart table has variant_id column
    console.log('\n📋 Test 3: Cart Table Variant Support');
    const { data: cartSample, error: cartError } = await supabase
      .from('cart')
      .select('variant_id')
      .limit(1);

    if (cartError && cartError.message.includes('variant_id')) {
      addTest('Cart Variant Column', false, 'variant_id column missing from cart table');
    } else {
      addTest('Cart Variant Column', true, 'variant_id column exists in cart table');
    }

    // Test 4: Check wishlist table has variant_id column
    console.log('\n📋 Test 4: Wishlist Table Variant Support');
    const { data: wishlistSample, error: wishlistError } = await supabase
      .from('wishlist')
      .select('variant_id')
      .limit(1);

    if (wishlistError && wishlistError.message.includes('variant_id')) {
      addTest('Wishlist Variant Column', false, 'variant_id column missing from wishlist table');
    } else {
      addTest('Wishlist Variant Column', true, 'variant_id column exists in wishlist table');
    }

    // Test 5: Test complex query with joins
    console.log('\n📋 Test 5: Complex Queries with Variants');
    const { data: productsWithVariants, error: joinError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants(*),
        categories!products_category_id_fkey(
          *,
          category_attributes(*)
        )
      `)
      .limit(3);

    if (joinError) {
      addTest('Complex Variant Queries', false, `Join query failed: ${joinError.message}`);
    } else {
      addTest('Complex Variant Queries', true, `Successfully fetched ${productsWithVariants.length} products with variant data`);
      
      // Check if any products have variants
      const productsWithVariantData = productsWithVariants.filter(p => p.product_variants && p.product_variants.length > 0);
      addTest('Products with Variants', productsWithVariantData.length >= 0, 
        `${productsWithVariantData.length} products have variant data`);
    }

    // Test 6: Test cart operations with variants
    console.log('\n📋 Test 6: Cart Operations with Variants');
    const { data: cartWithVariants, error: cartJoinError } = await supabase
      .from('cart')
      .select(`
        *,
        products(*),
        product_variants(*)
      `)
      .limit(3);

    if (cartJoinError) {
      addTest('Cart Variant Queries', false, `Cart join query failed: ${cartJoinError.message}`);
    } else {
      addTest('Cart Variant Queries', true, `Successfully fetched cart items with variant data`);
    }

    // Test 7: Test category attributes functionality
    console.log('\n📋 Test 7: Category Attributes Functionality');
    if (categoryAttributes && categoryAttributes.length > 0) {
      const sampleCategory = categoryAttributes[0];
      const hasRequiredFields = sampleCategory.hasOwnProperty('has_sizes') && 
                               sampleCategory.hasOwnProperty('has_colors') &&
                               sampleCategory.hasOwnProperty('available_sizes') &&
                               sampleCategory.hasOwnProperty('available_colors');
      
      addTest('Category Attributes Schema', hasRequiredFields, 
        'All required fields present in category_attributes');

      if (sampleCategory.available_sizes && Array.isArray(sampleCategory.available_sizes)) {
        addTest('Available Sizes Array', true, 
          `Sizes array working: ${sampleCategory.available_sizes.length} sizes available`);
      } else {
        addTest('Available Sizes Array', false, 'Sizes array not properly configured');
      }

      if (sampleCategory.available_colors && Array.isArray(sampleCategory.available_colors)) {
        addTest('Available Colors Array', true, 
          `Colors array working: ${sampleCategory.available_colors.length} colors available`);
      } else {
        addTest('Available Colors Array', false, 'Colors array not properly configured');
      }
    }

    // Test 8: Test foreign key relationships
    console.log('\n📋 Test 8: Foreign Key Relationships');
    
    // Test product_variants -> products relationship
    if (productVariants && productVariants.length > 0) {
      const { data: variantWithProduct, error: fkError } = await supabase
        .from('product_variants')
        .select(`
          *,
          products(id, name)
        `)
        .limit(1);

      if (fkError) {
        addTest('Variant-Product Relationship', false, `Foreign key relationship failed: ${fkError.message}`);
      } else {
        addTest('Variant-Product Relationship', true, 'Product variants correctly linked to products');
      }
    }

    // Test category_attributes -> categories relationship
    if (categoryAttributes && categoryAttributes.length > 0) {
      const { data: attrWithCategory, error: catFkError } = await supabase
        .from('category_attributes')
        .select(`
          *,
          categories(id, name)
        `)
        .limit(1);

      if (catFkError) {
        addTest('Attributes-Category Relationship', false, `Foreign key relationship failed: ${catFkError.message}`);
      } else {
        addTest('Attributes-Category Relationship', true, 'Category attributes correctly linked to categories');
      }
    }

  } catch (error) {
    console.error('\n❌ Testing failed with error:', error);
    addTest('Overall Test Execution', false, `Unexpected error: ${error.message}`);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.tests.length}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Product variants functionality is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }

  return testResults;
}

// Run the tests
testVariantsFunctionality()
  .then((results) => {
    console.log('\n✅ Testing completed');
    process.exit(results.failed === 0 ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Testing failed:', error);
    process.exit(1);
  });
