// context/SupabaseContext.js
"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';

const SupabaseContext = createContext();

export const SupabaseProvider = ({ children }) => {
  const { user, signIn, signOut, isAuthenticated, userDetails, fetchUserDetails } = useAuth();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState(null);
  const [cartItems, setCartItems] = useState(null);
  const [wishlistItems, setWishlistItems] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [deliveryCost, setDeliveryCost] = useState(null);

  const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes cache expiry
  const [cacheTimestamp, setCacheTimestamp] = useState({});

  const isCacheExpired = useCallback((key) => {
    return Date.now() - (cacheTimestamp[key] || 0) > CACHE_EXPIRY_MS;
  }, [cacheTimestamp]);

  const fetchProducts = useCallback(async () => {
    if (products && !isCacheExpired('products')) return products;
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    setProducts(data);
    setCacheTimestamp(prev => ({ ...prev, products: Date.now() }));
    return data;
  }, [products, isCacheExpired]);

  const fetchCategories = useCallback(async () => {
    if (categories && !isCacheExpired('categories')) return categories;
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    setCategories(data);
    setCacheTimestamp(prev => ({ ...prev, categories: Date.now() }));
    return data;
  }, [categories, isCacheExpired]);

  const fetchProductById = useCallback(async (id) => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }, []);

  const fetchProductsByCategory = useCallback(async (categoryName) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_name', categoryName);
    if (error) throw error;
    return data;
  }, []);

  const addToCart = useCallback(async (userId, productId, quantity) => {
    const { data, error } = await supabase
      .from('cart')
      .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: ['user_id', 'product_id'] });
    if (error) throw error;
    setCacheTimestamp(prev => ({ ...prev, cartItems: 0 }));
    return data;
  }, []);

  const fetchCartItems = useCallback(async (userId) => {
    if (cartItems && !isCacheExpired('cartItems')) return cartItems;
    const { data, error } = await supabase.from('cart').select('*').eq('user_id', userId);
    if (error) throw error;
    setCartItems(data);
    setCacheTimestamp(prev => ({ ...prev, cartItems: Date.now() }));
    return data;
  }, [cartItems, isCacheExpired]);

  const fetchWishlistItems = useCallback(async (userId) => {
    if (wishlistItems && !isCacheExpired('wishlistItems')) return wishlistItems;
    const { data, error } = await supabase.from('wishlist').select('*').eq('user_id', userId);
    if (error) throw error;
    setWishlistItems(data);
    setCacheTimestamp(prev => ({ ...prev, wishlistItems: Date.now() }));
    return data;
  }, [wishlistItems, isCacheExpired]);

  const addToWishlist = useCallback(async (userId, productId) => {
    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ user_id: userId, product_id: productId }]);
    if (error) throw error;
    setCacheTimestamp(prev => ({ ...prev, wishlistItems: 0 }));
    return data;
  }, []);

  const deleteFromWishlist = useCallback(async (userId, productId) => {
    const { data, error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw error;
    setCacheTimestamp(prev => ({ ...prev, wishlistItems: 0 }));
    return data;
  }, []);

  const fetchOrders = async (userId) => {
    // First get the orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    
    // Then get the associated product details
    if (orders) {
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const { data: product } = await supabase
            .from('products')
            .select('name, image_url, price')
            .eq('id', order.product_id)
            .single();
            
          return {
            ...order,
            product_details: product
          };
        })
      );
      return ordersWithDetails;
    }
    
    return [];
  };

  const fetchDeliveryAddress = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .single();
  
    if (!error && data) {
      setDeliveryAddress(data);
      setDeliveryCost(data.cost);
    }
  }, []);
  const updateDeliveryDetails = (address, cost) => {
    setDeliveryAddress(address);
    setDeliveryCost(cost);
  };

  useEffect(() => {
    if (user?.id) {
      fetchDeliveryAddress(user.id);
    }
  }, [user, fetchDeliveryAddress]);
  const value = {
    user,
    signIn,
    signOut,
    isAuthenticated,
    userDetails,
    fetchUserDetails,
    products,
    categories,
    fetchProducts,
    fetchCategories,
    fetchOrders,
    supabase,
    deliveryAddress,
    deliveryCost,
    setDeliveryCost,
    updateDeliveryDetails,
    fetchDeliveryAddress
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};export const useSupabaseContext = () => useContext(SupabaseContext);
