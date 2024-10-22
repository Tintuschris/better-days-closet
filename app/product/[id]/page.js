"use client";
import React, { useEffect, useState } from "react";
import { useSupabase } from "../../hooks/useSupabase";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/cartContext";

export default function ProductPage() {
  const { fetchProductById, fetchWishlistItems, addToWishlist, deleteFromWishlist } = useSupabase();
  const { cartItems, updateCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  // Fetch product details
  useEffect(() => {
    const getProduct = async () => {
      if (id) {
        const data = await fetchProductById(id);
        setProduct(data);
      }
    };
    getProduct();
  }, [id, fetchProductById]);

  // Check wishlist status
  useEffect(() => {
    const checkWishlist = async () => {
      if (user && product) {
        const wishlistItems = await fetchWishlistItems(user.id);
        const inWishlist = wishlistItems.some(
          (item) => item.product_id === product.id
        );
        setIsInWishlist(inWishlist);
      }
    };
    checkWishlist();
  }, [user, product, fetchWishlistItems]);

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
            image_url: product.image_url
          }
        };
        updatedCart = [...cartItems, newItem];
      }

      updateCart(updatedCart);
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistClick = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      if (isInWishlist) {
        await deleteFromWishlist(user.id, product.id);
        setIsInWishlist(false);
        alert("Removed from wishlist");
      } else {
        await addToWishlist(user.id, product.id);
        setIsInWishlist(true);
        alert("Added to wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert("Failed to update wishlist");
    }
  };

  if (!product) return <p className="text-primarycolor text-center">Loading...</p>;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <button onClick={() => router.back()}>
          <ChevronLeft className="w-12 h-12 text-primarycolor" />
        </button>
        <h1 className="text-[1rem] font-semibold text-primarycolor">
          PRODUCT DETAILS
        </h1>
        <Heart
          className={`w-10 h-10 cursor-pointer ${
            isInWishlist
              ? "fill-secondarycolor text-secondarycolor"
              : "fill-none text-primarycolor"
          }`}
          onClick={handleWishlistClick}
        />
      </div>

      {/* Product Image */}
      <div className="flex-grow p-6 relative">
        <Image
          src={product.image_url}
          alt={product.name}
          height={500}
          width={500}
          className="object-contain w-full h-full"
        />
      </div>

      {/* Product Info */}
      <div className="bg-secondarycolor p-4 rounded-t-3xl">
        <h2 className="text-[1.2rem] font-bold text-center text-primarycolor mb-4">
          {product.name}
        </h2>

        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-primarycolor">Quantity</span>
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

        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-primarycolor">
            Ksh. {product.price}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`bg-primarycolor text-white px-3 py-3 rounded-full flex items-center justify-center ${
              isAddingToCart ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isAddingToCart ? "Adding..." : "Add to cart"}
          </button>
        </div>

        {/* <div className="text-primarycolor text-center">
          <span className="font-bold">Total Items in Cart: {cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
        </div> */}
      </div>
    </div>
  );
}