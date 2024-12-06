"use client"
import { useEffect, useState } from 'react';
import { useWishlist } from '../../context/wishlistContext';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, ChevronLeft, Eye } from 'lucide-react';
import Link from 'next/link';

export default function Wishlist() {
  const { wishlistItems, loadWishlist, removeItem } = useWishlist();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    <div className="min-h-screen bg-white p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="text-primarycolor">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-primarycolor text-center flex-1">My Wishlist</h2>
      </div>

      <div className="space-y-4">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Your wishlist is empty</p>
            <button
              onClick={() => router.push('/')}
              className="bg-primarycolor text-white px-6 py-2 rounded-full"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          wishlistItems.map(product => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg p-3 flex gap-3 shadow-md border border-gray-100"
            >
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image 
                  src={product.image_url} 
                  alt={product.name} 
                  fill 
                  className="object-cover rounded-lg"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-primarycolor truncate pr-2">
                    {product.name}
                  </h3>
                  <button 
                    onClick={() => removeItem(user.id, product.id)}
                    className="text-warningcolor hover:text-red-700 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <p className="text-primarycolor font-bold mt-1">
                  KES {product.price.toLocaleString()}
                </p>
                
                <Link 
                  href={`/product/${product.id}`}
                  className="inline-flex items-center gap-2 mt-2 text-sm text-secondarycolor hover:text-primarycolor transition-colors"
                >
                  <Eye size={16} />
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
