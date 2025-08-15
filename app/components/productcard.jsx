"use client"
import Image from "next/image";
import { HeartIcon as Heart, PlusIcon as Plus } from '@heroicons/react/24/outline';
import Link from "next/link";
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSupabaseContext } from '../context/supabaseContext';
import { useCart } from '../context/cartContext';
import { toast } from 'sonner';

export default function ProductCard({ product }) {
  const router = useRouter();
  const {
    user,
    wishlistItems,
    addToWishlist,
    deleteFromWishlist
  } = useSupabaseContext();

  const { cartItems, updateCart } = useCart();

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (wishlistItems) {
      const productInWishlist = wishlistItems.some(item => item.product_id === product.id);
      setIsInWishlist(productInWishlist);
    }

    if (product.discount) {
      setDiscountPercentage(product.discount);
    }
  }, [wishlistItems, product.id, product.discount]);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      if (isInWishlist) {
        await deleteFromWishlist({ userId: user.id, productId: product.id });
        setIsInWishlist(false);
      } else {
        await addToWishlist({ userId: user.id, productId: product.id });
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      const currentPrice = discountPercentage > 0
        ? product.price * (1 - discountPercentage / 100)
        : product.price;

      // Create unique identifier for cart item
      const cartItemId = `${product.id}-no-size-no-color`;

      const existingItemIndex = cartItems.findIndex(
        (item) => item.cartItemId === cartItemId
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
          cartItemId,
          productId: product.id,
          variantId: null,
          selectedSize: null,
          selectedColor: null,
          quantity: 1,
          total_amount: currentPrice,
          product: {
            id: product.id,
            name: product.name,
            price: currentPrice,
            image_url: product.image_url,
            category_name: product.category_name,
          },
        };
        updatedCart = [...cartItems, newItem];
      }

      updateCart(updatedCart);

      toast.success("Added to cart", {
        description: `${product.name} added to your cart`,
        duration: 2000,
        position: "top-right",
      });
    } catch (error) {
      toast.error("Failed to add to cart", {
        description: "Please try again",
        duration: 2000,
        position: "top-right",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group relative">
      {/* Product Image Container */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative w-full pb-[100%] bg-gray-50">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-t-xl md:rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
          />

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-red-500 text-white font-semibold text-xs px-2 py-1 rounded-full shadow-sm">
              -{discountPercentage}%
            </div>
          )}

          {/* Wishlist Heart - Top Right */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 z-10"
          >
            <Heart
              className={`w-3 h-3 md:w-4 md:h-4 ${
                isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
              } transition-colors duration-200`}
            />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 md:p-4 relative">
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="text-xs md:text-sm font-medium text-gray-900 mb-2 truncate leading-tight" title={product.name}>
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0 flex-1">
              {discountPercentage > 0 ? (
                <>
                  <span className="text-xs text-gray-400 line-through">
                    Ksh. {product.price}
                  </span>
                  <span className="text-sm md:text-base font-bold text-gray-900 truncate">
                    Ksh. {(product.price * (1 - product.discount / 100)).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-sm md:text-base font-bold text-gray-900 truncate">
                  Ksh. {product.price}
                </span>
              )}
            </div>

            {/* Add to Cart Button - Responsive sizing */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm flex-shrink-0 ${
                isAddingToCart
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primarycolor hover:bg-primarycolor/90 text-white'
              }`}
            >
              {isAddingToCart ? (
                <div className="w-2 h-2 md:w-3 md:h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              )}
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
}
