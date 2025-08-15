"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ChevronLeft, X } from "lucide-react";
import Image from "next/image";
import { useCart } from "../context/cartContext";
import { toast } from "sonner";

export default function CartPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { cartItems, updateCart } = useCart();

  useEffect(() => {
    setIsLoading(false);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);
  }, [cartItems]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const updatedCart = cartItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      await updateCart(updatedCart);
      toast.success("Cart updated");
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const updatedCart = cartItems.filter(item => item.productId !== productId);
      await updateCart(updatedCart);
      toast.success("Item removed");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-primarycolor">Loading...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <div className="w-12 h-12 border-2 border-gray-300 rounded-full"></div>
        </div>
        <h2 className="text-xl font-semibold text-primarycolor mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Browse our categories and discover our best deals!
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-primarycolor text-white px-6 py-3 rounded-full hover:bg-primarycolor/90 transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <h1 className="text-lg font-semibold text-primarycolor">
            Shopping Cart
          </h1>

          <div className="w-10"></div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-[calc(100vh-73px)]">
        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-0">
            {cartItems.map((item, index) => (
              <div key={item.productId}>
                <div className="py-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="object-cover rounded-lg w-full h-full"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-primarycolor text-sm line-clamp-2 pr-2">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-primarycolor text-sm">
                          Ksh. {formatPrice(item.product.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-full">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-primarycolor hover:bg-gray-50 rounded-l-full transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium text-primarycolor min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-primarycolor hover:bg-gray-50 rounded-r-full transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dotted Separator - except for last item */}
                {index < cartItems.length - 1 && (
                  <div className="border-b border-dotted border-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Summary at Bottom */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-primarycolor">Total:</span>
            <span className="text-lg font-semibold text-primarycolor">
              Ksh. {formatPrice(subtotal)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-primarycolor text-white py-3 rounded-full font-medium hover:bg-primarycolor/90 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">

            {/* Cart Items - Desktop: 2 columns */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-lg w-full h-full"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-primarycolor text-base line-clamp-2 pr-2">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-primarycolor text-base">
                            Ksh. {formatPrice(item.product.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-200 rounded-full">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-primarycolor hover:bg-gray-50 rounded-l-full transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-primarycolor min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-primarycolor hover:bg-gray-50 rounded-r-full transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary - Desktop: Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-semibold text-primarycolor mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({cartItems.length})</span>
                    <span className="text-primarycolor font-medium">
                      Ksh. {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-primarycolor">Total</span>
                      <span className="text-primarycolor">
                        Ksh. {formatPrice(subtotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-primarycolor text-white py-3 rounded-full font-medium hover:bg-primarycolor/90 transition-colors"
                >
                  Proceed to Checkout
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Delivery cost will be calculated at checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}