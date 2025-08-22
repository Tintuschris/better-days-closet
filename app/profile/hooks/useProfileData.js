"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '../../lib/supabase';

const supabase = createClient();

// Query keys for consistent cache management
export const profileQueryKeys = {
  all: ['profile'],
  user: (userId) => [...profileQueryKeys.all, 'user', userId],
  orders: (userId) => [...profileQueryKeys.all, 'orders', userId],
  wishlist: (userId) => [...profileQueryKeys.all, 'wishlist', userId],
  addresses: (userId) => [...profileQueryKeys.all, 'addresses', userId],
  stats: (userId) => [...profileQueryKeys.all, 'stats', userId],
};

// Custom hooks for profile data management
export function useUserProfile(userId) {
  return useQuery({
    queryKey: profileQueryKeys.user(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserOrders(userId) {
  return useQuery({
    queryKey: profileQueryKeys.orders(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserWishlist(userId) {
  return useQuery({
    queryKey: profileQueryKeys.wishlist(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url,
            category_name,
            in_stock,
            discount
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserAddresses(userId) {
  return useQuery({
    queryKey: profileQueryKeys.addresses(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserStats(userId) {
  return useQuery({
    queryKey: profileQueryKeys.stats(userId),
    queryFn: async () => {
      // Get user statistics from materialized view if available
      const { data, error } = await supabase
        .from('user_profile_stats')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // Fallback to individual queries if materialized view doesn't exist
        const [wishlistCount, orderCount, addressCount] = await Promise.all([
          supabase.from('wishlist_items').select('*', { count: 'exact' }).eq('user_id', userId),
          supabase.from('orders').select('*', { count: 'exact' }).eq('user_id', userId),
          supabase.from('delivery_addresses').select('*', { count: 'exact' }).eq('user_id', userId)
        ]);
        
        return {
          wishlist_count: wishlistCount.count || 0,
          order_count: orderCount.count || 0,
          address_count: addressCount.count || 0,
          total_spent: 0
        };
      }
      
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Mutations for data updates
export function useAddToWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, productId }) => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: userId, product_id: productId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.invalidateQueries(profileQueryKeys.wishlist(variables.userId));
      queryClient.invalidateQueries(profileQueryKeys.stats(variables.userId));
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, productId }) => {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .match({ user_id: userId, product_id: productId });
      
      if (error) throw error;
      return { userId, productId };
    },
    onSuccess: (data) => {
      // Optimistically update the cache
      queryClient.invalidateQueries(profileQueryKeys.wishlist(data.userId));
      queryClient.invalidateQueries(profileQueryKeys.stats(data.userId));
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ addressId, updates, userId }) => {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .update(updates)
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(profileQueryKeys.addresses(variables.userId));
    },
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, address }) => {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .insert({ user_id: userId, ...address })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(profileQueryKeys.addresses(variables.userId));
      queryClient.invalidateQueries(profileQueryKeys.stats(variables.userId));
    },
  });
}

// Utility function to prefetch profile data
export function usePrefetchProfileData(userId) {
  const queryClient = useQueryClient();
  
  const prefetchAll = () => {
    queryClient.prefetchQuery({
      queryKey: profileQueryKeys.orders(userId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5); // Only prefetch recent orders
        
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 1000,
    });
    
    queryClient.prefetchQuery({
      queryKey: profileQueryKeys.wishlist(userId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('wishlist_items')
          .select('*, products(*)')
          .eq('user_id', userId)
          .limit(10); // Only prefetch first 10 items
        
        if (error) throw error;
        return data;
      },
      staleTime: 1 * 60 * 1000,
    });
  };
  
  return { prefetchAll };
}
