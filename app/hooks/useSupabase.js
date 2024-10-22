import { supabase } from '../lib/supabase';

export const useSupabase = () => {
  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data;
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
    console.log("Fetched categories:", data);
    return data;
  };

  const fetchProductById = async (id) => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  };

  const fetchProductsByCategory = async (categoryName) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_name', categoryName);
    if (error) throw error;
    return data;
  };

 // Updated addToCart function with upsert logic
const addToCart = async (userId, productId, quantity) => {
  try {
    // First check if item exists
    const { data: existingItem } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update existing item
      const { data, error } = await supabase
        .from('cart')
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString() // Optional: track last update
        })
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      return data;
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('cart')
        .insert([{ 
          user_id: userId, 
          product_id: productId, 
          quantity,
          created_at: new Date().toISOString() // Optional: track creation time
        }]);

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error in addToCart:', error);
    throw error;
  }
};

  const fetchCartItems = async (userId) => {
    const { data, error } = await supabase.from('cart').select('*').eq('user_id', userId);
    if (error) throw error;
    return data;
  };

  const updateCartInDatabase = async (userId, cartItems) => {
    // Only update the specific items that have changed
    for (const item of cartItems) {
      const { error } = await supabase
        .from('cart')
        .upsert({
          user_id: userId,
          product_id: item.product_id,
          quantity: item.quantity,
          total_amount: item.total_amount,
        }, {
          onConflict: 'user_id,product_id'
        });
  
      if (error) {
        console.error('Error updating cart in database:', error);
        throw error;
      }
    }
  };
  
  // Add this new function to delete cart items
  const deleteFromCart = async (userId, productId) => {
    const { error } = await supabase
      .from('cart')
      .delete()
      .match({ user_id: userId, product_id: productId });
  
    if (error) {
      console.error('Error deleting from cart:', error);
      throw error;
    }
  };
  const fetchOrders = async (userId) => {
    const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId);
    if (error) throw error;
    return data;
  };

  const fetchWishlistItems = async (userId) => {
    const { data, error } = await supabase.from('wishlist').select('*').eq('user_id', userId);
    if (error) throw error;
    return data;
  };

  const addToWishlist = async (userId, productId) => {
    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ user_id: userId, product_id: productId }]);
    if (error) throw error;
    return data;
  };

  const deleteFromWishlist = async (userId, productId) => {
    const { data, error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
    return data;
  };

  return {
    fetchProducts,
    fetchCategories,
    fetchProductById,
    fetchProductsByCategory,
    addToCart,
    fetchCartItems,
    deleteFromCart,
    updateCartInDatabase,  // Make sure it's available for the CartPage
    fetchOrders,
    fetchWishlistItems,
    addToWishlist,
    deleteFromWishlist,
  };
};
