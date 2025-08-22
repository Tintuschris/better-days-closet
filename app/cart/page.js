"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ChevronLeft, X } from "lucide-react";
import Image from "next/image";
import { useCart } from "../context/cartContext";
import { toast } from "sonner";
import { Button, QuantitySelector, GlassContainer } from "../components/ui";

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
        <Button
          onClick={() => router.push("/")}
          size="md"
          variant="primary"
          radius="full"
        >
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
      {/* Premium Header with glass morphism */}
      <div className="sticky top-0 backdrop-blur-xl bg-white/80 border-b border-white/20 z-10 shadow-lg shadow-primarycolor/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>

          <h1 className="text-lg font-semibold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent">
            Shopping Cart
          </h1>

          <div className="w-10 flex justify-end">
            <div className="relative">
              <div className="w-6 h-6 bg-gradient-to-r from-primarycolor to-primarycolor/90 text-white rounded-full flex items-center justify-center text-xs font-medium shadow-lg shadow-primarycolor/30">
                {cartItems.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-[calc(100vh-73px)]">
        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={item.productId} className="backdrop-blur-lg bg-white/80 rounded-2xl p-4 shadow-lg shadow-primarycolor/10 border border-white/20">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      width={64}
                      height={64}
                      className="object-cover rounded-xl w-full h-full shadow-md"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-primarycolor text-sm line-clamp-2 pr-2">
                        {item.product.name}
                      </h3>
                      <Button
                        onClick={() => handleRemoveItem(item.productId)}
                        variant="ghost"
                        size="xs"
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="font-semibold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent text-sm">
                        Ksh. {formatPrice(item.product.price)}
                      </p>

                      {/* Premium Quantity Controls */}
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(newQuantity) => handleQuantityChange(item.productId, newQuantity)}
                        size="sm"
                        variant="premium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Fixed Summary at Bottom */}
        <div className="backdrop-blur-xl bg-white/90 border-t border-white/30 p-4 shadow-lg shadow-primarycolor/10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent">Total:</span>
            <span className="text-lg font-semibold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent">
              Ksh. {formatPrice(subtotal)}
            </span>
          </div>

          <Button
            onClick={handleCheckout}
            variant="primary"
            size="lg"
            radius="full"
            className="w-full shadow-lg shadow-primarycolor/30"
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">

            {/* Premium Cart Items - Desktop: 2 columns */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="backdrop-blur-lg bg-white/80 border border-white/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-primarycolor/10 transition-all duration-300"
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-xl w-full h-full shadow-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-primarycolor text-base line-clamp-2 pr-2">
                            {item.product.name}
                          </h3>
                          <Button
                            onClick={() => handleRemoveItem(item.productId)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={18} />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="font-semibold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent text-lg">
                            Ksh. {formatPrice(item.product.price)}
                          </p>

                          {/* Premium Quantity Controls */}
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(newQuantity) => handleQuantityChange(item.productId, newQuantity)}
                            size="md"
                            variant="premium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Order Summary - Desktop: Sidebar */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-lg bg-white/80 border border-white/20 rounded-2xl p-6 lg:sticky lg:top-24 shadow-xl shadow-primarycolor/10">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({cartItems.length})</span>
                    <span className="text-primarycolor font-medium">
                      Ksh. {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="border-t border-gradient-to-r from-transparent via-primarycolor/20 to-transparent pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent">Total</span>
                      <span className="bg-gradient-to-r from-primarycolor to-primarycolor/80 bg-clip-text text-transparent">
                        Ksh. {formatPrice(subtotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  variant="primary"
                  size="lg"
                  radius="full"
                  className="w-full mt-6 shadow-lg shadow-primarycolor/30"
                >
                  Proceed to Checkout
                </Button>

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