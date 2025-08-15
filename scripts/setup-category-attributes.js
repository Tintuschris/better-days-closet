// Setup category attributes only (assumes schema is already updated)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCategoryAttributes() {
  console.log('🚀 Setting up category attributes...\n');

  try {
    // Get existing categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    console.log(`Found ${categories.length} categories to configure:`);
    categories.forEach(cat => console.log(`  - ${cat.name} (ID: ${cat.id})`));
    console.log('');

    // Setup attributes for each category
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

      console.log(`🔧 Configuring ${category.name}...`);
      console.log(`   Sizes: ${attributes.has_sizes ? 'Yes' : 'No'} ${attributes.available_sizes.length ? `(${attributes.available_sizes.join(', ')})` : ''}`);
      console.log(`   Colors: ${attributes.has_colors ? 'Yes' : 'No'} ${attributes.available_colors.length ? `(${attributes.available_colors.length} colors)` : ''}`);

      const { error: insertError } = await supabase
        .from('category_attributes')
        .upsert(attributes, { onConflict: 'category_id' });

      if (insertError) {
        console.log(`   ❌ Error: ${insertError.message}`);
      } else {
        console.log(`   ✅ Success`);
      }
      console.log('');
    }

    console.log('🎉 Category attributes setup completed!');
    
    // Verify the setup
    console.log('\n📊 Verification - Categories with variant support:');
    const { data: attributesCheck } = await supabase
      .from('category_attributes')
      .select(`
        *,
        categories(name)
      `)
      .or('has_sizes.eq.true,has_colors.eq.true');

    if (attributesCheck) {
      attributesCheck.forEach(attr => {
        console.log(`  ✅ ${attr.categories.name}: Sizes=${attr.has_sizes}, Colors=${attr.has_colors}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    throw error;
  }
}

// Run the setup
setupCategoryAttributes()
  .then(() => {
    console.log('\n✅ Category attributes setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
