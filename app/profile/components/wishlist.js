"use client"
import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '../../hooks/useSupabase';

export default function Wishlist() {
  const { fetchWishlistItems, deleteFromWishlist } = useSupabase();
  const [wishlist, setWishlist] = useState([]);
  const userId = 1;  // Replace with actual user ID

  const fetchWishlist = useCallback(
    async () => {
      const data = await fetchWishlistItems(userId);
      setWishlist(data);
    },
    [fetchWishlistItems, userId]
  );

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleDelete = useCallback(
    async (productId) => {
      await deleteFromWishlist(userId, productId);
      setWishlist(wishlist.filter(item => item.product_id !== productId));
    },
    [deleteFromWishlist, userId, wishlist]
  );

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">My Wishlist</h2>
      {wishlist.length === 0 && <p>Your wishlist is empty.</p>}
      {wishlist.map(item => (
        <div key={item.id} className="border p-4 rounded mb-4 flex justify-between">
          <p>{item.product_name}</p>
          <button onClick={() => handleDelete(item.product_id)} className="text-red-500">Remove</button>
        </div>
      ))}
    </div>
  );
}


