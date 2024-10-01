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
    console.log("Fetched categories:", data);  // Add this line for debugging
    return data;
  };
  

  const fetchProductById = async (id) => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  };

  // New function to fetch products by category
  const fetchProductsByCategory = async (category) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category);  // Adjust according to your category field in the database
    if (error) throw error;
    return data;
  };

  const addToCart = async (userId, productId, quantity) => {
    const { data, error } = await supabase
      .from('cart')
      .insert([{ user_id: userId, product_id: productId, quantity }]);
    if (error) throw error;
    return data;
  };

  const fetchCartItems = async (userId) => {
    const { data, error } = await supabase.from('cart').select('*').eq('user_id', userId);
    if (error) throw error;
    return data;
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
    fetchProductsByCategory,  // Return the new function here
    addToCart,
    fetchCartItems,
    fetchOrders,
    fetchWishlistItems,
    deleteFromWishlist,
  };
};
