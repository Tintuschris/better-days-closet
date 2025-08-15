// Updated database operations for product variants feature
// This shows how the existing supabaseContext.js and useSupabase.js should be modified

// ===== UPDATED QUERIES FOR PRODUCTS WITH VARIANTS =====

// Updated Products Query (for supabaseContext.js)
const productsWithVariantsQuery = {
  queryKey: ['products'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants(*),
        categories!products_category_id_fkey(
          *,
          category_attributes(*)
        )
      `);
    if (error) throw error;
    return data;
  },
  staleTime: 1000 * 60 * 5,
};

// ===== NEW CATEGORY ATTRIBUTES OPERATIONS =====

// Fetch category attributes
const fetchCategoryAttributes = async () => {
  const { data, error } = await supabase
    .from('category_attributes')
    .select('*');
  if (error) throw error;
  return data;
};

// Add/Update category attributes
const upsertCategoryAttributes = async (categoryId, attributes) => {
  const { data, error } = await supabase
    .from('category_attributes')
    .upsert({
      category_id: categoryId,
      ...attributes,
      updated_at: new Date().toISOString()
    });
  if (error) throw error;
  return data;
};

// ===== PRODUCT VARIANTS OPERATIONS =====

// Add product variant
const addProductVariant = async (variant) => {
  const { data, error } = await supabase
    .from('product_variants')
    .insert([variant])
    .select();
  if (error) throw error;
  return data;
};

// Update product variant
const updateProductVariant = async (id, variant) => {
  const { data, error } = await supabase
    .from('product_variants')
    .update(variant)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
};

// Delete product variant
const deleteProductVariant = async (id) => {
  const { data, error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
};

// Get variants for a product
const getProductVariants = async (productId) => {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId);
  if (error) throw error;
  return data;
};

// ===== UPDATED CART OPERATIONS =====

// Updated Add to Cart with variant support
const addToCartWithVariant = async ({ userId, productId, variantId, quantity }) => {
  const { data, error } = await supabase
    .from('cart')
    .upsert({
      user_id: userId,
      product_id: productId,
      variant_id: variantId,
      quantity
    }, {
      onConflict: ['user_id', 'product_id', 'variant_id']
    })
    .select();
  if (error) throw error;
  return data;
};

// Updated Cart Items Query with variants
const cartItemsWithVariantsQuery = (userId) => ({
  queryKey: ['cart', userId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('cart')
      .select(`
        *,
        products(*),
        product_variants(*)
      `)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },
  enabled: !!userId,
  staleTime: 1000 * 60 * 2,
});

// ===== UPDATED WISHLIST OPERATIONS =====

// Updated Add to Wishlist with variant support
const addToWishlistWithVariant = async ({ userId, productId, variantId }) => {
  const { data, error } = await supabase
    .from('wishlist')
    .insert([{
      user_id: userId,
      product_id: productId,
      variant_id: variantId
    }])
    .select();
  if (error) throw error;
  return data;
};

// Updated Wishlist Items Query with variants
const wishlistItemsWithVariantsQuery = (userId) => ({
  queryKey: ['wishlist', userId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        products(*),
        product_variants(*)
      `)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },
  enabled: !!userId,
});

// ===== HELPER FUNCTIONS =====

// Check if category supports variants
const categorySupportsVariants = (category) => {
  return category?.category_attributes?.[0]?.has_sizes || 
         category?.category_attributes?.[0]?.has_colors;
};

// Get available sizes for category
const getAvailableSizes = (category) => {
  return category?.category_attributes?.[0]?.available_sizes || [];
};

// Get available colors for category
const getAvailableColors = (category) => {
  return category?.category_attributes?.[0]?.available_colors || [];
};

// Find variant by size and color
const findVariant = (variants, size, color) => {
  return variants?.find(v => 
    v.size === size && v.color === color
  );
};

// Get variant price (base price + variant price if different)
const getVariantPrice = (basePrice, variant) => {
  return variant?.price || basePrice;
};

// Format variant display name
const getVariantDisplayName = (variant) => {
  const parts = [];
  if (variant?.size) parts.push(`Size: ${variant.size}`);
  if (variant?.color) parts.push(`Color: ${variant.color}`);
  return parts.join(', ') || 'Default';
};

export {
  // Queries
  productsWithVariantsQuery,
  cartItemsWithVariantsQuery,
  wishlistItemsWithVariantsQuery,
  
  // Category Attributes
  fetchCategoryAttributes,
  upsertCategoryAttributes,
  
  // Product Variants
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getProductVariants,
  
  // Cart Operations
  addToCartWithVariant,
  
  // Wishlist Operations
  addToWishlistWithVariant,
  
  // Helper Functions
  categorySupportsVariants,
  getAvailableSizes,
  getAvailableColors,
  findVariant,
  getVariantPrice,
  getVariantDisplayName
};
