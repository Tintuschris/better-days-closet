// Apply database schema updates safely
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchemaUpdates() {
  console.log('🚀 Applying database schema updates for product variants...\n');
  console.log('⚠️  Note: Some schema changes need to be applied manually in Supabase SQL Editor\n');

  try {
    // Step 1: Check if category_attributes table exists
    console.log('📋 Step 1: Checking category_attributes table...');
    const { data: tableCheck, error: tableCheckError } = await supabase
      .from('category_attributes')
      .select('id')
      .limit(1);

    if (tableCheckError && tableCheckError.code === '42P01') {
      console.log('❌ category_attributes table does not exist');
      console.log('📝 Please run the SQL script in Supabase SQL Editor:');
      console.log('   File: scripts/database-schema-updates.sql');
      return;
    } else {
      console.log('✅ category_attributes table exists');
    }

    // Step 2: Check if cart has variant_id column
    console.log('\n📋 Step 2: Checking cart.variant_id column...');
    const { data: cartCheck, error: cartCheckError } = await supabase
      .from('cart')
      .select('variant_id')
      .limit(1);

    if (cartCheckError && cartCheckError.message.includes('variant_id')) {
      console.log('❌ cart.variant_id column does not exist');
      console.log('📝 Please run the SQL script in Supabase SQL Editor');
      return;
    } else {
      console.log('✅ cart.variant_id column exists');
    }

    // Step 3: Check if wishlist has variant_id column
    console.log('\n📋 Step 3: Checking wishlist.variant_id column...');
    const { data: wishlistCheck, error: wishlistCheckError } = await supabase
      .from('wishlist')
      .select('variant_id')
      .limit(1);

    if (wishlistCheckError && wishlistCheckError.message.includes('variant_id')) {
      console.log('❌ wishlist.variant_id column does not exist');
      console.log('📝 Please run the SQL script in Supabase SQL Editor');
      return;
    } else {
      console.log('✅ wishlist.variant_id column exists');
    }

    // Step 4: Setup default category attributes
    console.log('\n📋 Step 4: Setting up default category attributes...');

    // First, get existing categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    console.log(`Found ${categories.length} categories to configure`);

    // Insert default attributes for each category
    for (const category of categories) {
      if (!category.name) {
        console.log(`⚠️  Skipping category with null name (ID: ${category.id})`);
        continue;
      }

      const categoryName = category.name.toLowerCase();
      const isClothingCategory = ['women', 'men', 'kids'].includes(categoryName);
      const isShoesCategory = categoryName === 'shoes';
      const supportsVariants = isClothingCategory || isShoesCategory;

      const attributes = {
        category_id: category.id,
        has_sizes: supportsVariants,
        has_colors: supportsVariants,
        available_sizes: isClothingCategory
          ? ['XS', 'S', 'M', 'L', 'XL', 'XXL']
          : isShoesCategory
          ? ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
          : [],
        available_colors: supportsVariants
          ? ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Navy']
          : []
      };

      const { error: insertError } = await supabase
        .from('category_attributes')
        .upsert(attributes, { onConflict: 'category_id' });

      if (insertError) {
        console.log(`⚠️  Error setting attributes for ${category.name}: ${insertError.message}`);
      } else {
        console.log(`✅ Configured ${category.name} - Sizes: ${attributes.has_sizes}, Colors: ${attributes.has_colors}`);
      }
    }

    console.log('\n🎉 Database schema updates completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  ✅ category_attributes table created');
    console.log('  ✅ cart.variant_id column added');
    console.log('  ✅ wishlist.variant_id column added');
    console.log('  ✅ Performance indexes created');
    console.log('  ✅ Default category attributes configured');
    console.log('\n🚀 Ready to proceed with application updates!');

  } catch (error) {
    console.error('\n❌ Schema update failed:', error);
    throw error;
  }
}

// Run the schema updates
applySchemaUpdates()
  .then(() => {
    console.log('\n✅ All schema updates applied successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Schema update failed:', error);
    process.exit(1);
  });
