"use client"
import Image from "next/image";
import { HeartIcon as Heart, PlusIcon as Plus } from '@heroicons/react/24/outline';
import Link from "next/link";
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSupabaseContext } from '../context/supabaseContext';
import { useCart } from '../context/cartContext';
import { toast } from 'sonner';
import Button from "@/app/components/ui/Button";

export default function ProductCard({ product, viewMode = 'grid' }) {
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

    // Check if product has variants - if so, redirect to product page
    if ((product.variant_count || 0) > 0) {
      router.push(`/product/${product.id}`);
      return;
    }

    setIsAddingToCart(true);

    try {
      // Use min_price for products with variants, fallback to price
      const basePrice = product.min_price || product.price;
      const currentPrice = discountPercentage > 0
        ? basePrice * (1 - discountPercentage / 100)
        : basePrice;

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

  // Grid View (Default)
  if (viewMode === 'grid') {
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
                  isInWishlist ? 'fill-red-500 text-red-500' : 'text-primarycolor/60 hover:text-red-500'
                } transition-colors duration-200`}
              />
            </button>
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-3 md:p-4 relative">
          <Link href={`/product/${product.id}`} className="block">
            <h3 className="text-xs md:text-sm font-medium text-primarycolor mb-2 truncate leading-tight" title={product.name}>
              {product.name}
            </h3>

            {/* Price Section */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0 flex-1">
                {(() => {
                  const basePrice = product.min_price || product.price;
                  const maxPrice = product.max_price || product.price;
                  const showRange = basePrice !== maxPrice;

                  if (discountPercentage > 0) {
                    const discountedPrice = basePrice * (1 - product.discount / 100);
                    return (
                      <>
                        <span className="text-xs text-primarycolor/70 line-through">
                          Ksh. {showRange ? `${basePrice} - ${maxPrice}` : basePrice}
                        </span>
                        <span className="text-sm md:text-base font-bold text-primarycolor truncate">
                          Ksh. {showRange ? `${discountedPrice.toFixed(0)} - ${(maxPrice * (1 - product.discount / 100)).toFixed(0)}` : discountedPrice.toFixed(0)}
                        </span>
                      </>
                    );
                  } else {
                    return (
                      <span className="text-sm md:text-base font-bold text-primarycolor truncate">
                        Ksh. {showRange ? `${basePrice} - ${maxPrice}` : basePrice}
                      </span>
                    );
                  }
                })()}
              </div>

              {/* Add to Cart Button - Responsive sizing */}
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || (product.total_inventory || 0) === 0}
                variant="primary"
                size="sm"
                radius="full"
                className="!w-8 !h-8 md:!w-10 md:!h-10 !p-0 shadow-sm flex-shrink-0 min-w-0"
                loading={isAddingToCart}
                title={(product.variant_count || 0) > 0 ? "View options" : "Add to cart"}
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </Button>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group relative max-w-4xl mx-auto">
      <div className="flex gap-4 p-4">
        {/* Product Image - Compact for List View */}
        <Link href={`/product/${product.id}`} className="block flex-shrink-0">
          <div className="relative w-20 h-20 md:w-32 md:h-32 bg-gray-50 rounded-xl overflow-hidden">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              sizes="(max-width: 768px) 80px, 128px"
              className="group-hover:scale-105 transition-transform duration-300"
            />

            {/* Compact Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-1 left-1 bg-red-500 text-white font-semibold text-xs px-1.5 py-0.5 rounded-md shadow-sm">
                -{discountPercentage}%
              </div>
            )}
          </div>
        </Link>

        {/* Product Info - Expanded for List View */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <Link href={`/product/${product.id}`} className="block">
              <h3 className="text-sm md:text-lg font-semibold text-primarycolor mb-1 md:mb-2 line-clamp-2 leading-tight">
                {product.name}
              </h3>

              {/* Category Badge */}
              <div className="mb-2">
                <span className="inline-block px-2 py-1 bg-primarycolor/10 text-primarycolor/70 text-xs rounded-full">
                  {product.category_name?.charAt(0).toUpperCase() + product.category_name?.slice(1).toLowerCase()}
                </span>
              </div>

              {/* Price Section - Horizontal Layout */}
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const basePrice = product.min_price || product.price;
                  const maxPrice = product.max_price || product.price;
                  const showRange = basePrice !== maxPrice;

                  if (discountPercentage > 0) {
                    const discountedPrice = basePrice * (1 - product.discount / 100);
                    return (
                      <>
                        <span className="text-lg md:text-xl font-bold text-primarycolor">
                          Ksh. {showRange ? `${discountedPrice.toFixed(0)} - ${(maxPrice * (1 - product.discount / 100)).toFixed(0)}` : discountedPrice.toFixed(0)}
                        </span>
                        <span className="text-sm text-primarycolor/70 line-through">
                          Ksh. {showRange ? `${basePrice} - ${maxPrice}` : basePrice}
                        </span>
                      </>
                    );
                  } else {
                    return (
                      <span className="text-lg md:text-xl font-bold text-primarycolor">
                        Ksh. {showRange ? `${basePrice} - ${maxPrice}` : basePrice}
                      </span>
                    );
                  }
                })()}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs md:text-sm text-primarycolor/70">
                {(() => {
                  const totalStock = product.total_inventory || 0;
                  const isInStock = totalStock > 0;
                  return (
                    <>
                      <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>
                        {isInStock ? `${totalStock} in stock` : 'Out of Stock'}
                        {(product.variant_count || 0) > 0 && ` • ${product.variant_count} variants`}
                      </span>
                    </>
                  );
                })()}
              </div>
            </Link>
          </div>

          {/* Action Buttons - Bottom Right */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {/* Rating Display (if available) */}
              {product.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm text-primarycolor/70">{product.rating}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistClick}
                className="w-10 h-10 bg-primarycolor/5 hover:bg-primarycolor/10 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist ? 'fill-red-500 text-red-500' : 'text-primarycolor/60 hover:text-red-500'
                  } transition-colors duration-200`}
                />
              </button>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                variant="primary"
                size="md"
                radius="xl"
                className="px-4 py-2 md:px-6 md:py-3"
                loading={isAddingToCart}
                loadingText={<span className="hidden md:inline">Adding...</span>}
              >
                <Plus className="w-4 h-4 text-white" />
                <span className="hidden md:inline text-white">Add to Cart</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
