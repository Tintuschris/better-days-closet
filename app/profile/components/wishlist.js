"use client"
import { useEffect, useState, useCallback } from 'react';
import { useWishlist } from '../../context/wishlistContext';
import { useAuth } from '../../hooks/useAuth';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function Wishlist() {
  const { wishlistItems, loadWishlist, removeItem } = useWishlist();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist(user.id).finally(() => setLoading(false));
    }
  }, [user, loadWishlist]);

  if (!user) {
    return <p className="text-primarycolor">Please log in to view your wishlist.</p>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primarycolor"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-primarycolor text-center mb-6">My Wishlist</h2>
      {wishlistItems.length === 0 && (
        <p className="text-center text-gray-600">Your wishlist is empty.</p>
      )}
      {wishlistItems.map(product => (
        <div 
          key={product.id} 
          className="bg-primarycolor rounded-lg p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="relative h-20 w-20 flex-shrink-0">
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-secondarycolor">{product.name}</h3>
            <p className="text-secondarycolor font-bold">KES {product.price}</p>
            <div className="flex gap-4 items-center mt-2">
              <Link 
                href={`/product/${product.id}`} 
                className="bg-secondarycolor text-primarycolor px-3 py-1 rounded-full text-sm hover:opacity-90 transition-opacity"
              >
                View Details
              </Link>
              <button 
                onClick={() => removeItem(user.id, product.id)} 
                className="text-warningcolor hover:text-red-700 transition-colors ml-auto"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
