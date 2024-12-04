"use client";
import { createContext, useContext, useState, useCallback } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistProductIds, setWishlistProductIds] = useState(new Set());
  const { fetchWishlistItems, deleteFromWishlist, addToWishlist, fetchProductById } = useSupabase();

  const loadWishlist = useCallback(async (userId) => {
    try {
      const items = await fetchWishlistItems(userId);
      const products = await Promise.all(
        items.map(item => fetchProductById(item.product_id))
      );
      setWishlistItems(products);
      setWishlistProductIds(new Set(products.map(p => p.id)));
      return products;
    } catch (error) {
      toast.error('Failed to load wishlist');
      return [];
    }
  }, [fetchWishlistItems, fetchProductById]);

  const addItem = useCallback(async (userId, productId) => {
    try {
      await addToWishlist(userId, productId);
      const product = await fetchProductById(productId);
      setWishlistItems(prev => [...prev, product]);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error('Failed to add item');
    }
  }, [addToWishlist, fetchProductById]);

  const removeItem = useCallback(async (userId, productId) => {
    try {
      await deleteFromWishlist(userId, productId);
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  }, [deleteFromWishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlistProductIds.has(productId);
  }, [wishlistProductIds]);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      loadWishlist,
      addItem,
      removeItem,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}
export const useWishlist = () => useContext(WishlistContext);
