"use client";
import { useEffect, useState } from 'react';
import { useWishlist } from '../context/wishlistContext';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const { wishlistItems, loadWishlist, removeItem } = useWishlist();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadWishlist(user.id).finally(() => setLoading(false));
    }
  }, [user, loadWishlist]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primarycolor"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen">
      <div className="flex items-center mb-6 relative">
        <button 
          onClick={() => router.back()} 
          className="absolute left-0 text-primarycolor"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-primarycolor w-full text-center">
          My Wishlist
        </h1>
      </div>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your wishlist is empty</p>
          <Link href="/shop" className="text-primarycolor hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlistItems.map(product => (
            <div 
              key={product.id} 
              className="bg-primarycolor rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image 
                  src={product.image_url} 
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-lg text-secondarycolor mb-2">
                  {product.name}
                </h3>
                <p className="text-secondarycolor font-bold mb-2">
                  KES {product.price}
                </p>
                <div className="flex justify-between items-center">
                  <Link 
                    href={`/product/${product.id}`}
                    className="text-secondarycolor hover:underline"
                  >
                    View Details
                  </Link>
                  <button 
                    onClick={() => removeItem(user.id, product.id)}
                    className="text-warningcolor hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
