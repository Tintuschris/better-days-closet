// context/SupabaseContext.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';  // Import the useAuth hook

const SupabaseContext = createContext();

export const SupabaseProvider = ({ children }) => {
  const { user, signIn, signOut, isAuthenticated } = useAuth();  // Destructure auth-related functions

  // Caching state for products, categories, etc.
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState(null);
  const [cartItems, setCartItems] = useState(null);
  const [wishlistItems, setWishlistItems] = useState(null);

  // Cache expiry setup (optional)
  const CACHE_EXPIRY_MS = 60 * 1000; // Cache expiry in milliseconds (e.g., 60 seconds)
  const [cacheTimestamp, setCacheTimestamp] = useState({});

  const isCacheExpired = (key) => {
    return Date.now() - (cacheTimestamp[key] || 0) > CACHE_EXPIRY_MS;
  };

  // ----------------- Read Operations -----------------

  const fetchProducts = async () => {
    if (products && !isCacheExpired('products')) return products;
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    setProducts(data);
    setCacheTimestamp((prev) => ({ ...prev, products: Date.now() }));
    return data;
  };

  const fetchCategories = async () => {
    if (categories && !isCacheExpired('categories')) return categories;
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    setCategories(data);
    setCacheTimestamp((prev) => ({ ...prev, categories: Date.now() }));
    return data;
  };

  const fetchCartItems = async (userId) => {
    if (cartItems && !isCacheExpired('cartItems')) return cartItems;
    const { data, error } = await supabase.from('cart').select('*').eq('user_id', userId);
    if (error) throw error;
    setCartItems(data);
    setCacheTimestamp((prev) => ({ ...prev, cartItems: Date.now() }));
    return data;
  };

  const fetchWishlistItems = async (userId) => {
    if (wishlistItems && !isCacheExpired('wishlistItems')) return wishlistItems;
    const { data, error } = await supabase.from('wishlist').select('*').eq('user_id', userId);
    if (error) throw error;
    setWishlistItems(data);
    setCacheTimestamp((prev) => ({ ...prev, wishlistItems: Date.now() }));
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

  const fetchOrders = async (userId) => {
    const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId);
    if (error) throw error;
    return data;
  };

  // ----------------- Mutation Operations (Write Operations) -----------------

  const addToCart = async (userId, productId, quantity) => {
    const { data, error } = await supabase
      .from('cart')
      .insert([{ user_id: userId, product_id: productId, quantity }]);
    if (error) throw error;

    // After adding to cart, invalidate the cart cache
    setCacheTimestamp((prev) => ({ ...prev, cartItems: 0 }));
    return data;
  };

  const addToWishlist = async (userId, productId) => {
    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ user_id: userId, product_id: productId }]);
    if (error) throw error;

    // Invalidate wishlist cache after adding item
    setCacheTimestamp((prev) => ({ ...prev, wishlistItems: 0 }));
    return data;
  };

  const deleteFromWishlist = async (userId, productId) => {
    const { data, error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;

    // Invalidate wishlist cache after deletion
    setCacheTimestamp((prev) => ({ ...prev, wishlistItems: 0 }));
    return data;
  };

  // ----------------- Provide Everything Through Context -----------------

  return (
    <SupabaseContext.Provider
      value={{
        fetchProducts,
        fetchCategories,
        fetchProductById,
        fetchProductsByCategory,
        addToCart,
        fetchCartItems,
        fetchOrders,
        fetchWishlistItems,
        addToWishlist,
        deleteFromWishlist,
        user,            // Provide the auth-related values
        signIn,
        signOut,
        isAuthenticated,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};

// Hook to use the Supabase context
export const useSupabaseContext = () => useContext(SupabaseContext);
