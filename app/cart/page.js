"use client";
import React, { useEffect, useState } from "react";
import { useSupabase } from "../hooks/useSupabase";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCart } from "../context/cartContext";

export default function CartPage() {
  const { fetchProductById } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const { cartItems, updateCart } = useCart();
  const [cartWithDetails, setCartWithDetails] = useState([]);

  // Fetch product details for each cart item
  const fetchCartProductDetails = async (cartItems) => {
    try {
      const itemsWithDetails = await Promise.all(
        cartItems.map(async (cartItem) => {
          const productDetails = await fetchProductById(cartItem.productId);
          return {
            ...cartItem,
            product: productDetails,
            total_amount: productDetails.price * cartItem.quantity,
          };
        })
      );
      return itemsWithDetails;
    } catch (error) {
      console.error("Error fetching product details:", error);
      return [];
    }
  };

  useEffect(() => {
    const initializeCart = async () => {
      const itemsWithDetails = await fetchCartProductDetails(cartItems);
      setCartWithDetails(itemsWithDetails);
      setIsLoading(false);
    };

    initializeCart();
  }, [cartItems]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedItems = cartItems.map(item => 
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );

    updateCart(updatedItems);
  };

  const handleRemoveItem = (productId) => {
    const updatedItems = cartItems.filter(item => item.productId !== productId);
    updateCart(updatedItems);
  };

  const subtotal = cartWithDetails.reduce((acc, item) => {
    return acc + item.total_amount;
  }, 0);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 min-h-screen bg-white">
      <div className="flex items-center mb-4">
        <ArrowLeft className="text-purple-700 cursor-pointer" onClick={() => router.back()} />
        <h1 className="text-2xl font-bold text-purple-700 ml-4">MY CART</h1>
        <div className="ml-auto relative">
          <div className="bg-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs absolute -top-2 -right-2">
            {cartItems.length}
          </div>
          <ShoppingCart />
        </div>
      </div>

      {cartWithDetails.map((item) => (
        <div key={item.productId} className="bg-pink-100 rounded-lg p-4 mb-4 flex items-center">
          <Image
            src={item.product.image_url}
            alt={item.product.name}
            width={80}
            height={80}
            className="object-cover rounded-lg mr-4"
          />
          <div className="flex-grow">
            <p className="font-semibold">{item.product.name}</p>
            <div className="flex items-center mt-2">
              <button 
                className="text-purple-700"
                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
              >
                <Minus size={20} />
              </button>
              <span className="mx-2 text-primarycolor">{item.quantity}</span>
              <button 
                className="text-purple-700"
                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className="font-bold text-primarycolor">
              Ksh. {item.total_amount.toFixed(2)}
            </p>
            <button 
              className="text-warningcolor mt-2"
              onClick={() => handleRemoveItem(item.productId)}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}

      <div className="mt-6">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Sub Total</span>
          <span className="font-bold">Ksh. {subtotal.toFixed(2)}</span>
        </div>
        <button className="w-full bg-gray-200 text-purple-700 py-2 rounded-lg mb-4">
          Add Delivery Cost
        </button>
        <div className="flex justify-between mb-4">
          <span className="font-semibold">Total Cost</span>
          <span className="font-bold">Ksh. {subtotal.toFixed(2)}</span>
        </div>
        <button
          className="w-full bg-purple-700 text-white py-3 rounded-lg"
          onClick={() => router.push("/checkout")}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}