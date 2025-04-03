"use client";
import { useEffect, useState, Suspense } from 'react';
import { useWishlist } from '../context/wishlistContext';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/cartContext';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Trash2, ShoppingCart, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const formatPrice = (price) => {
  return typeof price === 'number' 
    ? price.toFixed(2) 
    : Number(price).toFixed(2);
};

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <WishlistContent />
    </Suspense>
  );
}

function WishlistContent() {
  const { wishlistItems, loadWishlist, removeItem } = useWishlist();
  const { user } = useAuth();
  const { cartItems, updateCart } = useCart();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadWishlist(user.id).finally(() => setLoading(false));
    }
  }, [user, loadWishlist]);

  const handleAddToCart = async (product) => {
    try {
      const existingItemIndex = cartItems.findIndex(
        (item) => item.productId === product.id
      );
  
      let updatedCart;
      if (existingItemIndex !== -1) {
        updatedCart = cartItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const newItem = {
          productId: product.id,
          quantity: 1,
          total_amount: product.price,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            category_name: product.category_name,
          },
        };
        updatedCart = [...cartItems, newItem];
      }
  
      updateCart(updatedCart);
      toast.success('Added to cart', {
        description: `${product.name} added to your cart`,
        duration: 3000,
        position: "top-right",
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--primarycolor)',
        },
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart', {
        description: "Please try again",
        duration: 3000,
        position: "top-right",
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--warningcolor)',
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primarycolor"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Consistent with other pages */}
      <div className="sticky top-0 z-10 bg-white p-4 border-b flex items-center">
        <button 
          onClick={() => router.back()} 
          className="text-primarycolor"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-primarycolor mx-auto">
          MY WISHLIST
        </h1>
        <div className="w-5"></div>
      </div>
      
      <div className="max-w-6xl mx-auto p-4">
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-primarycolor mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-center mb-6">
              Items added to your wishlist will appear here
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-primarycolor text-white rounded-full hover:bg-primarycolor/90 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map(product => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square">
                  <Image 
                    src={product.image_url} 
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-primarycolor mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-primarycolor font-bold mb-3">
                    Ksh. {formatPrice(product.price)}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 py-2 bg-primarycolor text-white rounded-lg flex items-center justify-center gap-1 hover:bg-primarycolor/90 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => removeItem(user.id, product.id)}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
