"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2, Plus, Minus, ShoppingCart, ChevronLeft, Save, X,
} from "lucide-react";
import Image from "next/image";
import { useCart } from "../context/cartContext";
import { useSupabaseContext } from "../context/supabaseContext";
import { toast } from "sonner";
import DeliveryModal from "../components/DeliveryModal";

export default function CartPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const router = useRouter();
  const { cartItems, updateCart } = useCart();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [cartWithDetails, setCartWithDetails] = useState([]);
  const { user, deliveryAddressData, deliveryCost, setDeliveryCost } = useSupabaseContext();

  // Initialize delivery cost from saved data
  useEffect(() => {
    if (user && deliveryAddressData?.cost) {
      setDeliveryCost(Number(deliveryAddressData.cost));
    } else {
      const guestDeliveryDetails = localStorage.getItem('guestDeliveryDetails');
      if (guestDeliveryDetails) {
        const details = JSON.parse(guestDeliveryDetails);
        setDeliveryCost(Number(details.cost));
      }
    }
  }, [user, deliveryAddressData, setDeliveryCost]);

  useEffect(() => {
    setCartWithDetails(cartItems);
    setIsLoading(false);
  }, [cartItems]);

  const { subtotal, totalCost } = useMemo(() => {
    const sub = cartWithDetails.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);
    return {
      subtotal: sub,
      totalCost: sub + (deliveryCost || 0),
    };
  }, [cartWithDetails, deliveryCost]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItems = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedItems);
  };

  const toggleItemSelection = (productId) => {
    if (!isSelectionMode) return;
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    const updatedItems = cartItems.filter(
      (item) => !selectedItems.has(item.productId)
    );
    updateCart(updatedItems);
    setSelectedItems(new Set());
    setIsSelectionMode(false);
    toast.success("Selected items removed from cart");
  };

  const handleSaveForLater = () => {
    toast.success("Items saved for later");
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  };

  const handleAddDeliveryCost = () => {
    if (user) {
      router.push("/profile?tab=delivery");
    } else {
      setIsDeliveryModalOpen(true);
    }
  };

  const handleDeliverySelection = (deliveryData) => {
    setDeliveryCost(Number(deliveryData.cost));
  };

  const handleCheckout = () => {
    if (!deliveryCost) {
      toast.error("Add Delivery Cost to Continue", {
        description: "Please select a delivery option before proceeding to checkout",
        duration: 3000,
        position: "top-right",
        style: {
          background: 'var(--secondarycolor)',
          color: 'var(--primarycolor)',
        },
      });
      return;
    }
    router.push("/checkout");
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (cartWithDetails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <ShoppingCart className="w-24 h-24 text-primarycolor mb-4" />
        <h2 className="text-2xl font-bold text-primarycolor mb-2">
          Your cart is empty
        </h2>
        <p className="text-primarycolor mb-6 text-center">
          Browse our categories and discover our best deals!
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-primarycolor text-white px-6 py-3 rounded-full"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with increased bottom margin on desktop */}
      <div className="p-4 mb-4 md:mb-8">
        <div className="flex items-center justify-between relative md:justify-start md:gap-4">
          {isSelectionMode ? (
            <>
              <button
                onClick={exitSelectionMode}
                className="text-primarycolor flex items-center"
              >
                <X className="w-6 h-6 mr-1" />
                Cancel
              </button>
              <span className="text-primarycolor font-medium">
                {selectedItems.size} selected
              </span>
            </>
          ) : (
            <>
              <ChevronLeft
                className="text-primarycolor cursor-pointer"
                onClick={() => router.back()}
              />
              <h1 className="absolute left-1/2 -translate-x-1/2 md:static md:left-0 md:transform-none text-2xl font-bold text-primarycolor">
                MY CART
              </h1>
              <button
                onClick={() => setIsSelectionMode(true)}
                className="text-primarycolor text-sm md:ml-auto"
              >
                Select Items
              </button>
            </>
          )}
        </div>
        <div className="h-px bg-gray-200 mt-4"></div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="md:grid md:grid-cols-2 md:gap-8 md:h-[calc(100vh-120px)]">

          {/* Scrollable Cart Items Section with subtle background */}
          <div className="md:overflow-auto md:pr-4 md:bg-primarycolor/5 md:rounded-lg md:p-4">
            <div className="space-y-4">
              {cartWithDetails.map((item) => (
                <div
                  key={item.productId}
                  className={`bg-secondaryvariant rounded-lg p-4 flex items-center relative ${
                    isSelectionMode ? "cursor-pointer" : ""
                  } ${
                    selectedItems.has(item.productId)
                      ? "border-2 border-primarycolor"
                      : ""
                  }`}
                  onClick={() => toggleItemSelection(item.productId)}
                >
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="object-cover rounded-lg mr-4"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-primarycolor">
                      {item.product.name}
                    </p>
                    <div className="flex items-center mt-2">
                      <div
                        className="flex items-center px-3 py-1 bg-transparent border border-primarycolor rounded-full"
                        onClick={(e) => isSelectionMode && e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            handleQuantityChange(item.productId, item.quantity - 1)
                          }
                          className="px-3 py-1 text-primarycolor font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-primarycolor">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.productId, item.quantity + 1)
                          }
                          className="px-3 py-1 text-primarycolor font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end min-w-[100px]">
                    <p className="font-bold text-purple-900 whitespace-nowrap">
                      Ksh. {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Static Pricing & Checkout Section */}
          <div className="md:h-fit">
            <div className="mt-6">
              <div className="flex justify-between mb-8">
                <span className="font-medium text-primarycolor">Sub Total</span>
                <span className="font-medium text-primarycolor">
                  Ksh. {subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between mb-8">
                {!deliveryCost ? (
                  <>
                    <button
                      onClick={handleAddDeliveryCost}
                      className="w-1/2 border-2 border-primarycolor text-primarycolor font-medium py-2 rounded-full"
                    >
                      Add Delivery Cost
                    </button>
                    <span className="text-primarycolor font-medium">Ksh. 0</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-primarycolor">
                      Delivery Cost
                    </span>
                    <span className="font-medium text-primarycolor">
                      Ksh. {deliveryCost.toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              <div className="border-b border-primarycolor my-8"></div>

              <div className="flex justify-between mb-8">
                <span className="font-bold text-primarycolor">Total Cost</span>
                <span className="font-bold text-primarycolor">
                  Ksh. {totalCost.toFixed(2)}
                </span>
              </div>

              <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg md:static md:p-0 md:shadow-none">
                {isSelectionMode && selectedItems.size > 0 ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveForLater}
                      className="w-1/2 py-3 rounded-full border-2 border-primarycolor text-primarycolor"
                    >
                      Save for Later
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="w-1/2 py-3 rounded-full bg-warningcolor text-white"
                    >
                      Remove Items
                    </button>
                  </div>
                ) : (
                  <button
                    className={`w-full py-3 rounded-full ${
                      deliveryCost
                        ? "bg-primarycolor text-white hover:bg-primarycolor"
                        : "bg-primarycolor/50 text-white"
                    }`}
                    onClick={handleCheckout}
                  >
                    Checkout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isDeliveryModalOpen && (
        <DeliveryModal
          onClose={() => setIsDeliveryModalOpen(false)}
          onSelect={handleDeliverySelection}
        />
      )}
    </div>
  );
}
