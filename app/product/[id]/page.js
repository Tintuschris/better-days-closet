"use client";
import React, { useEffect, useState } from "react";
import { useSupabaseContext } from "../../context/supabaseContext";
import { useWishlist } from "../../context/wishlistContext";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Heart, ShoppingCart, Share2, Star } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/cartContext";
import { toast } from "sonner";
import ProductCarousel from "@/app/components/productcarousel";

export default function ProductPage() {
  const { products, user, wishlistItems, addToWishlist, deleteFromWishlist } =
    useSupabaseContext();
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const { cartItems, updateCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const params = useParams();
  const router = useRouter();

  const product = products?.find((p) => p.id.toString() === params.id);

  const relatedProducts = products
    ?.filter(
      (p) => p.category_name === product?.category_name && p.id !== product?.id
    )
    .slice(0, 4);

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
    setIsAddingToCart(true);
  
    try {
      const existingItemIndex = cartItems.findIndex(
        (item) => item.productId === product.id
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
          productId: product.id,
          quantity,
          total_amount: product.price * quantity,
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
      toast.success("Added to cart", {
        description: `${quantity} ${product.name} added to your cart`,
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
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <button onClick={() => router.back()}>
          <ChevronLeft className="w-8 h-8 text-primarycolor" />
        </button>
        <h1 className="text-[1rem] font-semibold text-primarycolor">
          PRODUCT DETAILS
        </h1>
        <div className="flex gap-2">
          <Share2
            className="w-6 h-6 text-primarycolor cursor-pointer"
            onClick={handleShare}
          />
          <Heart
            className={`w-6 h-6 cursor-pointer ${
              isWishlisted
                ? "fill-secondarycolor text-secondarycolor"
                : "fill-none text-primarycolor"
            }`}
            onClick={handleWishlistClick}
          />
        </div>
      </div>
  
      <div className="max-w-[1400px] mx-auto w-full px-4 mb-8 md:mb-12">
        {/* Product Details Section */}
        <div className="md:flex md:gap-8 md:items-stretch md:mt-8">
          {/* Product Images Section */}
          <div className="md:w-[45%] flex-grow relative md:p-0">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-primarycolor/5">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain w-full h-full rounded-[12px]"
                priority
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="hidden md:grid grid-cols-4 gap-2 mt-4">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-primarycolor cursor-pointer bg-primarycolor/5">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={100}
                  height={100}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
  
          {/* Product Info */}
          <div className="md:w-[55%]">
            <div className="bg-secondarycolor p-4 md:p-6 rounded-t-3xl md:rounded-lg h-full">
              {/* Category Badge */}
              <div className="inline-block px-3 py-1 rounded-full bg-primarycolor bg-opacity-10 text-primarycolor text-sm mb-3">
                {product.category_name}
              </div>
  
              {/* Product Title and Price */}
              <div className="space-y-2 mb-4">
                <h2 className="text-[1.2rem] md:text-2xl font-bold text-primarycolor">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primarycolor">
                    Ksh. {(product.price * (1 - product.discount / 100)).toFixed(2)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-lg line-through text-primarycolorvariant">
                      Ksh. {product.price}
                    </span>
                  )}
                </div>
              </div>
  
              {/* Ratings Section */}
              <div className="flex items-center mb-4 border-b border-gray-200 pb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (product.rating || 4)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-primarycolor">
                  ({product.reviews || 0} reviews)
                </span>
              </div>
  
              {/* Description Section */}
              <div className="mb-6 border-b border-gray-200 pb-4">
                <h3 className="text-sm font-semibold text-primarycolor mb-2">
                  Description
                </h3>
                <p className="text-sm text-primarycolor leading-relaxed">
                  {product.description || "No description available"}
                </p>
              </div>
  
              {/* Quantity and Add to Cart Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-primarycolor">Quantity</span>
                  <div className="flex items-center px-3 py-1 bg-transparent border border-primarycolor rounded-full">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-primarycolor font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-primarycolor">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 text-primarycolor font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
  
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className={`w-full bg-primarycolor text-white py-3 rounded-full font-bold flex items-center justify-center ${
                    isAddingToCart ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isAddingToCart ? "Adding..." : "Add to cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
  
        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <ProductCarousel
              title={`More from ${product.category_name}`}
              products={relatedProducts}
              category={product.category_name}
              isSpecialCategory={false}
            />
          </div>
        )}
      </div>
    </div>
  );    
  
}
