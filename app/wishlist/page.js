"use client";
import { useEffect, useState } from 'react';
import { useSupabaseContext } from '../context/supabaseContext';

export default function WishlistPage() {
  const { fetchWishlistItems, deleteFromWishlist, user } = useSupabaseContext();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (user) {
      fetchWishlistItems(user.id).then(setWishlist);
    }
  }, [user, fetchWishlistItems]);

  const handleDelete = async (productId) => {
    await deleteFromWishlist(user.id, productId);
    setWishlist(wishlist.filter(item => item.product_id !== productId));
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">My Wishlist</h1>
      {wishlist.length === 0 && <p>Your wishlist is empty.</p>}
      {wishlist.map(item => (
        <div key={item.id} className="flex justify-between mb-4 border p-4 rounded">
          <p>{item.product_name}</p>
          <button onClick={() => handleDelete(item.product_id)} className="text-red-500">Remove</button>
        </div>
      ))}
    </div>
  );
}
