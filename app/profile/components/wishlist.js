"use client"
import { useEffect, useState, useCallback } from 'react';
import { useSupabaseContext } from '../../context/supabaseContext';
import Image from 'next/image';

export default function Wishlist() {
  const { fetchWishlistItems, deleteFromWishlist, fetchProductById, user } = useSupabaseContext();
  const [wishlistProducts, setWishlistProducts] = useState([]);

  const fetchWishlist = useCallback(async () => {
    if (user) {
      const wishlistItems = await fetchWishlistItems(user.id);
      const productsPromises = wishlistItems.map(item => fetchProductById(item.product_id));
      const products = await Promise.all(productsPromises);
      setWishlistProducts(products);
    }
  }, [fetchWishlistItems, fetchProductById, user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleDelete = useCallback(async (productId) => {
    if (user) {
      await deleteFromWishlist(user.id, productId);
      setWishlistProducts(wishlistProducts.filter(product => product.id !== productId));
    }
  }, [deleteFromWishlist, user, wishlistProducts]);

  if (!user) {
    return <p>Please log in to view your wishlist.</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 text-primarycolor">My Wishlist</h2>
      {wishlistProducts.length === 0 && <p>Your wishlist is empty.</p>}
      {wishlistProducts.map(product => (
        <div key={product.id} className="border p-4 rounded mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Image src={product.image_url} alt={product.name} width={50} height={50} className="mr-4" />
            <p className='text-primarycolor'>{product.name}</p>
          </div>
          <button onClick={() => handleDelete(product.id)} className="text-red-500">Remove</button>
        </div>
      ))}
    </div>
  );
}
