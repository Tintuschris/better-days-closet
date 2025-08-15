// Migration script for existing data to work with new variants system
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateExistingData() {
  console.log('🔄 Starting data migration for product variants...\n');

  try {
    // Step 1: Check existing cart items without variants
    console.log('📋 Step 1: Checking existing cart items...');
    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select('*')
      .is('variant_id', null);

    if (cartError) {
      console.error('Error fetching cart items:', cartError);
      return;
    }

    console.log(`Found ${cartItems.length} cart items without variant information`);

    // Step 2: Check existing wishlist items without variants
    console.log('\n📋 Step 2: Checking existing wishlist items...');
    const { data: wishlistItems, error: wishlistError } = await supabase
      .from('wishlist')
      .select('*')
      .is('variant_id', null);

    if (wishlistError) {
      console.error('Error fetching wishlist items:', wishlistError);
      return;
    }

    console.log(`Found ${wishlistItems.length} wishlist items without variant information`);

    // Step 3: Check products that might need default variants
    console.log('\n📋 Step 3: Checking products for default variants...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants(*),
        categories!products_category_id_fkey(
          *,
          category_attributes(*)
        )
      `);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return;
    }

    // Find products in variant-supporting categories that don't have variants
    const productsNeedingVariants = products.filter(product => {
      const categoryAttributes = product.categories?.category_attributes?.[0];
      const supportsVariants = categoryAttributes?.has_sizes || categoryAttributes?.has_colors;
      const hasVariants = product.product_variants && product.product_variants.length > 0;
      
      return supportsVariants && !hasVariants;
    });

    console.log(`Found ${productsNeedingVariants.length} products that could benefit from default variants`);

    // Step 4: Create default variants for products in variant-supporting categories
    if (productsNeedingVariants.length > 0) {
      console.log('\n📋 Step 4: Creating default variants...');
      
      for (const product of productsNeedingVariants) {
        const categoryAttributes = product.categories?.category_attributes?.[0];
        
        // Create a default variant with the product's current price and quantity
        const defaultVariant = {
          product_id: product.id,
          size: null,
          color: null,
          price: product.price,
          quantity: product.quantity,
          image_url: null
        };

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert([defaultVariant]);

        if (variantError) {
          console.error(`Error creating default variant for product ${product.id}:`, variantError);
        } else {
          console.log(`✅ Created default variant for "${product.name}"`);
        }
      }
    }

    // Step 5: Update cart items to use total_amount based on variant prices
    console.log('\n📋 Step 5: Updating cart item calculations...');
    
    for (const cartItem of cartItems) {
      // Get the product to calculate correct total_amount
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('price')
        .eq('id', cartItem.product_id)
        .single();

      if (!productError && product) {
        const correctTotal = product.price * cartItem.quantity;
        
        if (cartItem.total_amount !== correctTotal) {
          const { error: updateError } = await supabase
            .from('cart')
            .update({ total_amount: correctTotal })
            .eq('id', cartItem.id);

          if (updateError) {
            console.error(`Error updating cart item ${cartItem.id}:`, updateError);
          } else {
            console.log(`✅ Updated cart item total for product ${cartItem.product_id}`);
          }
        }
      }
    }

    // Step 6: Verify data integrity
    console.log('\n📋 Step 6: Verifying data integrity...');
    
    // Check for orphaned variants
    const { data: orphanedVariants, error: orphanError } = await supabase
      .from('product_variants')
      .select(`
        id,
        product_id,
        products(id)
      `)
      .is('products.id', null);

    if (orphanError) {
      console.error('Error checking for orphaned variants:', orphanError);
    } else {
      console.log(`Found ${orphanedVariants.length} orphaned variants (should be 0)`);
    }

    // Check for category attributes without categories
    const { data: orphanedAttributes, error: attrOrphanError } = await supabase
      .from('category_attributes')
      .select(`
        id,
        category_id,
        categories(id)
      `)
      .is('categories.id', null);

    if (attrOrphanError) {
      console.error('Error checking for orphaned attributes:', attrOrphanError);
    } else {
      console.log(`Found ${orphanedAttributes.length} orphaned category attributes (should be 0)`);
    }

    // Step 7: Generate migration summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`📦 Products checked: ${products.length}`);
    console.log(`🆕 Default variants created: ${productsNeedingVariants.length}`);
    console.log(`🛒 Cart items processed: ${cartItems.length}`);
    console.log(`❤️  Wishlist items processed: ${wishlistItems.length}`);
    console.log(`⚠️  Orphaned variants: ${orphanedVariants.length}`);
    console.log(`⚠️  Orphaned attributes: ${orphanedAttributes.length}`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Test the application thoroughly');
    console.log('2. Verify variant selection works on product pages');
    console.log('3. Test cart and wishlist functionality with variants');
    console.log('4. Check admin panel variant management');
    console.log('5. Verify category attributes configuration');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Helper function to backup important data before migration
async function backupData() {
  console.log('💾 Creating data backup...');
  
  try {
    // Backup cart data
    const { data: cartBackup } = await supabase
      .from('cart')
      .select('*');
    
    // Backup wishlist data
    const { data: wishlistBackup } = await supabase
      .from('wishlist')
      .select('*');
    
    // Backup products data
    const { data: productsBackup } = await supabase
      .from('products')
      .select('*');

    const backupData = {
      timestamp: new Date().toISOString(),
      cart: cartBackup,
      wishlist: wishlistBackup,
      products: productsBackup
    };

    // Save backup to file
    const fs = require('fs');
    const backupFileName = `backup-${Date.now()}.json`;
    fs.writeFileSync(backupFileName, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup saved to ${backupFileName}`);
    return backupFileName;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Create backup first
    const backupFile = await backupData();
    
    // Run migration
    await migrateExistingData();
    
    console.log(`\n💾 Backup file: ${backupFile}`);
    console.log('Keep this backup file until you\'re confident the migration was successful.');
    
  } catch (error) {
    console.error('\n❌ Migration process failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateExistingData, backupData };
