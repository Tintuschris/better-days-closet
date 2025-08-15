"use client";
import React, { useEffect, useState } from "react";
import { useSupabaseContext } from "../../context/supabaseContext";
import { useWishlist } from "../../context/wishlistContext";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeftIcon as ChevronLeft,
  HeartIcon as Heart,
  ShoppingCartIcon as ShoppingCart,
  ShareIcon as Share2,
  StarIcon as Star,
  TruckIcon as Truck,
  CheckCircleIcon as CheckCircle,
  ShieldCheckIcon as Shield,
  ChevronDownIcon as ChevronDown
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/cartContext";
import { useProductVariants } from "../../hooks/useProductVariants";
import { toast } from "sonner";
import ProductCarousel from "@/app/components/productcarousel";

export default function ProductPage() {
  const { products, user, wishlistItems, addToWishlist, deleteFromWishlist } =
    useSupabaseContext();
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const { cartItems, updateCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const params = useParams();
  const router = useRouter();

  // Use the product variants hook
  const {
    product,
    variants,
    availableSizes,
    availableColors,
    hasSizes,
    hasColors,
    getVariantPrice,
    getVariantStock,
    getVariantImage,
    getVariantByOptions
  } = useProductVariants(params.id);

  const relatedProducts = products
    ?.filter(
      (p) => p.category_name === product?.category_name && p.id !== product?.id
    )
    .slice(0, 6);

  // Get current variant based on selections
  const currentVariant = getVariantByOptions(selectedSize, selectedColor);
  const currentPrice = getVariantPrice(selectedSize, selectedColor);
  const currentStock = getVariantStock(selectedSize, selectedColor);
  const currentImage = getVariantImage(selectedSize, selectedColor);

  // Product images - use variant image if available, otherwise product image
  const productImages = [currentImage, product?.image_url].filter(Boolean);

  // Set default selections when variants load
  useEffect(() => {
    if (hasSizes && availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
    if (hasColors && availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableSizes, availableColors, hasSizes, hasColors, selectedSize, selectedColor]);

  useEffect(() => {
    if (wishlistItems) {
      const productInWishlist = wishlistItems.some(
        (item) => item.product_id === product?.id
      );
      setIsWishlisted(productInWishlist);
    }
  }, [wishlistItems, product?.id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleWishlistClick = async (e) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      if (isWishlisted) {
        await deleteFromWishlist({ userId: user.id, productId: product.id });
        setIsWishlisted(false);
      } else {
        await addToWishlist({ userId: user.id, productId: product.id });
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
    }
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || !product) return;

    // Validate stock
    if (currentStock < quantity) {
      toast.error("Insufficient stock", {
        description: `Only ${currentStock} items available`,
        duration: 3000,
        position: "top-right",
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--warningcolor)',
        },
      });
      return;
    }

    // Validate required selections
    if (hasSizes && !selectedSize) {
      toast.error("Please select a size", {
        duration: 3000,
        position: "top-right",
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--warningcolor)',
        },
      });
      return;
    }

    if (hasColors && !selectedColor) {
      toast.error("Please select a color", {
        duration: 3000,
        position: "top-right",
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--warningcolor)',
        },
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      // Create unique identifier for cart item (includes variant info)
      const cartItemId = `${product.id}-${selectedSize || 'no-size'}-${selectedColor || 'no-color'}`;

      const existingItemIndex = cartItems.findIndex(
        (item) => item.cartItemId === cartItemId
      );

      let updatedCart;
      if (existingItemIndex !== -1) {
        updatedCart = cartItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem = {
          cartItemId,
          productId: product.id,
          variantId: currentVariant?.id || null,
          selectedSize,
          selectedColor,
          quantity,
          total_amount: currentPrice * quantity,
          product: {
            id: product.id,
            name: product.name,
            price: currentPrice,
            image_url: currentImage,
            category_name: product.category_name,
          },
        };
        updatedCart = [...cartItems, newItem];
      }

      updateCart(updatedCart);

      const variantText = [selectedSize, selectedColor].filter(Boolean).join(', ');
      const description = variantText
        ? `${quantity} ${product.name} (${variantText}) added to your cart`
        : `${quantity} ${product.name} added to your cart`;

      toast.success("Added to cart", {
        description,
        duration: 3000,
        position: "top-right",
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--primarycolor)',
        },
      });
    } catch (error) {
      toast.error("Failed to add to cart", {
        description: "Please try again",
        duration: 3000,
        position: "top-right",
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--warningcolor)',
        },
      });
    } finally {
      setIsAddingToCart(false);
    }
  };
  

  if (!products) {
    return <p className="text-primarycolor text-center">Loading...</p>;
  }

  if (!product) {
    return <p className="text-primarycolor text-center">Product not found</p>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Header */}
      <div className="flex justify-between items-center p-4 bg-white sticky top-0 z-40 border-b border-primarycolor/10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-primarycolor/10 transition-colors duration-200"
        >
          <ChevronLeft className="w-6 h-6 text-primarycolor" />
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl hover:bg-primarycolor/10 transition-colors duration-200"
          >
            <Share2 className="w-5 h-5 text-primarycolor" />
          </button>
          <button
            onClick={handleWishlistClick}
            className="p-2 rounded-xl hover:bg-primarycolor/10 transition-colors duration-200"
          >
            {isWishlisted ? (
              <HeartSolid className="w-5 h-5 text-secondarycolor" />
            ) : (
              <Heart className="w-5 h-5 text-primarycolor" />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto md:max-w-7xl px-4 pb-20 md:pb-8">
        <div className="md:flex md:gap-12 md:items-start">
          {/* Product Images Section */}
          <div className="md:w-1/2">
            {/* Main Image */}
            <div className="relative aspect-square bg-primarycolor/5 rounded-2xl overflow-hidden mb-4 border border-primarycolor/10">
              <Image
                src={productImages[currentImageIndex] || product.image_url}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
              />
            </div>

            {/* Image Dots Indicator */}
            {productImages.length > 1 && (
              <div className="flex justify-center space-x-2 mb-6">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex
                        ? 'bg-primarycolor w-6'
                        : 'bg-primarycolor/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 space-y-6">
            {/* Brand */}
            <div className="text-sm font-medium text-primarycolorvariant uppercase tracking-wide">
              {product.category_name}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-primarycolor leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= (product.rating || 4)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-primarycolor/20 text-primarycolor/20"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-primarycolor">
                4.8 ({product.reviews || 217} Reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-primarycolor">
                Ksh {(currentPrice * (1 - (product?.discount || 0) / 100)).toFixed(0)}
              </span>
              {product?.discount > 0 && (
                <>
                  <span className="text-xl text-primarycolorvariant line-through">
                    Ksh {currentPrice}
                  </span>
                  <span className="px-2 py-1 bg-secondarycolor/20 text-primarycolor text-sm font-medium rounded-lg">
                    -{product.discount}%
                  </span>
                </>
              )}
            </div>

            {/* Size Selection */}
            {hasSizes && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primarycolor">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-full border-2 font-medium transition-all duration-200 ${
                        selectedSize === size
                          ? 'border-primarycolor bg-primarycolor text-white'
                          : 'border-primarycolor/30 text-primarycolor hover:border-primarycolor hover:bg-primarycolor/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {hasColors && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primarycolor">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full border-2 font-medium transition-all duration-200 capitalize ${
                        selectedColor === color
                          ? 'border-primarycolor bg-primarycolor text-white'
                          : 'border-primarycolor/30 text-primarycolor hover:border-primarycolor hover:bg-primarycolor/10'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Features */}
            <div className="space-y-3">
              <div className={`flex items-center space-x-3 ${currentStock > 0 ? 'text-primarycolor' : 'text-red-500'}`}>
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {currentStock > 0 ? `In stock (${currentStock} available)` : 'Out of stock'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-secondarycolor">
                <Truck className="w-5 h-5" />
                <span className="text-sm font-medium">Free delivery</span>
              </div>
              <div className="flex items-center space-x-3 text-primarycolorvariant">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Authentic • Free returns above</span>
              </div>
            </div>

            {/* Expandable Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primarycolor">Description</h3>
              <div className="relative">
                <div
                  className={`text-primarycolor/80 leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${
                    isDescriptionExpanded ? 'max-h-none' : 'max-h-[4.5rem]'
                  }`}
                >
                  <p className="text-sm md:text-base">
                    {product?.description || "No description available"}
                  </p>
                </div>

                {/* Show gradient overlay when collapsed and text is long */}
                {!isDescriptionExpanded && product?.description && product.description.length > 150 && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}

                {/* Show More/Less Button */}
                {product?.description && product.description.length > 150 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="flex items-center space-x-1 mt-2 text-secondarycolor hover:text-primarycolor transition-colors duration-200 font-medium text-sm"
                  >
                    <span>{isDescriptionExpanded ? 'Show Less' : 'Show More'}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isDescriptionExpanded ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                onClick={handleWishlistClick}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isWishlisted
                    ? 'border-secondarycolor bg-secondarycolor/20'
                    : 'border-primarycolor/30 hover:border-primarycolor hover:bg-primarycolor/10'
                }`}
              >
                {isWishlisted ? (
                  <HeartSolid className="w-6 h-6 text-secondarycolor" />
                ) : (
                  <Heart className="w-6 h-6 text-primarycolor" />
                )}
              </button>

              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || currentStock === 0}
                className={`flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
                  currentStock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isAddingToCart
                    ? "bg-gradient-to-r from-primarycolor to-secondarycolor text-white opacity-50 cursor-not-allowed"
                    : "bg-gradient-to-r from-primarycolor to-secondarycolor text-white transform hover:scale-[1.02] hover:shadow-lg"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>
                  {currentStock === 0
                    ? "Out of Stock"
                    : isAddingToCart
                    ? "Adding..."
                    : "Add to Cart"
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
  
        {/* Enhanced Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-primarycolor/10 pt-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-primarycolor mb-2">
                You might also like
              </h3>
              <p className="text-primarycolor/70">
                Similar products from {product.category_name}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="group cursor-pointer"
                  onClick={() => router.push(`/product/${relatedProduct.id}`)}
                >
                  <div className="bg-primarycolor/5 rounded-2xl overflow-hidden mb-3 aspect-square relative group-hover:shadow-lg transition-all duration-200 border border-primarycolor/10 group-hover:border-primarycolor/30">
                    <Image
                      src={relatedProduct.image_url}
                      alt={relatedProduct.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-primarycolor text-sm line-clamp-2 group-hover:text-secondarycolor transition-colors">
                      {relatedProduct.name}
                    </h4>
                    <p className="text-sm font-bold text-primarycolor">
                      Ksh {(relatedProduct.price * (1 - (relatedProduct.discount || 0) / 100)).toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
