// context/SupabaseContext.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const SupabaseContext = createContext();

export const SupabaseProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { user, signIn, signOut, isAuthenticated, userDetails, fetchUserDetails } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [deliveryCost, setDeliveryCost] = useState(null);

  // Products Query
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Categories Query
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Cart Items Query
  const { data: cartItems } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Wishlist Items Query
  const { data: wishlistItems } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Add to Cart Mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ userId, productId, quantity }) => {
      const { data, error } = await supabase
        .from('cart')
        .upsert({ user_id: userId, product_id: productId, quantity },
          { onConflict: ['user_id', 'product_id'] });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });

  // Delete from Cart Mutation
  const deleteFromCartMutation = useMutation({
    mutationFn: async ({ userId, productId }) => {
      const { data, error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });

  // Add to Wishlist Mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async ({ userId, productId }) => {
      const { data, error } = await supabase
        .from('wishlist')
        .insert([{ user_id: userId, product_id: productId }]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
    },
  });

  // Delete from Wishlist Mutation
  const deleteFromWishlistMutation = useMutation({
    mutationFn: async ({ userId, productId }) => {
      const { data, error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
    },
  });

  // Orders Query
  const { data: orders } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
    // Delivery Address Query
    const { data: deliveryAddressData } = useQuery({
      queryKey: ['address', user?.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .single();
        console.log('Fetched Address Data:', data); // Add this log
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      },
      enabled: !!user?.id,
      onSuccess: (data) => {
        if (data) {
          console.log('Setting Address Data:', data); // Add this log
          setDeliveryAddress(data);
          setDeliveryCost(Number(data.cost));
        }
      },
    });
  // Create Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          user_id: orderData.user_id,
          status: 'PENDING',
          total_amount: orderData.total_amount,
          mpesa_code: orderData.mpesa_code,
          delivery_option: orderData.delivery_option,
          region: orderData.region || null,
          area: orderData.area || null,
          courier_service: orderData.courier_service || null,
          pickup_point: orderData.pickup_point || null,
          delivery_cost: orderData.delivery_cost,
          cart_items: orderData.cart_items,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
  
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['cart']);
    },
  });
  const createOrderItemsMutation = useMutation({
    mutationFn: async (orderItems) => {
      const { data, error } = await supabase
        .from('order_items')
        .insert(orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          user_id: item.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
      if (error) throw error;
      return data;
    }
  });

  const updateDeliveryDetails = (address, cost) => {
    setDeliveryAddress(address);
    setDeliveryCost(cost);
  };
  
  const createPendingOrderMutation = useMutation({
    mutationFn: async ({ orderData, checkoutRequestId }) => {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          status: 'PENDING',
          checkout_request_id: checkoutRequestId,
          mpesa_code: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });

  const value = {
    user,
    signIn,
    signOut,
    isAuthenticated,
    userDetails,
    fetchUserDetails,
    products,
    categories,
    cartItems,
    wishlistItems,
    orders,
    deliveryAddress,
    deliveryCost,
    deliveryAddressData,
    setDeliveryCost,
    addToCart: addToCartMutation.mutate,
    deleteFromCart: deleteFromCartMutation.mutate,
    addToWishlist: addToWishlistMutation.mutate,
    deleteFromWishlist: deleteFromWishlistMutation.mutate,
    createOrder: createOrderMutation.mutate,
    updateDeliveryDetails,
    supabase,
    createOrderItems: createOrderItemsMutation.mutate,
    createPendingOrder: createPendingOrderMutation.mutate,
  };
  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseContext = () => useContext(SupabaseContext);
