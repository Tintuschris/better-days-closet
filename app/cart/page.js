"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2, Plus, Minus, ShoppingCart, ChevronLeft, Save, X, AlertCircle, CheckSquare
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isMultipleDelete, setIsMultipleDelete] = useState(false);
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

  const handleQuantityChange = (productId, newQuantity, e) => {
    if (e) e.stopPropagation();
    if (newQuantity < 1) {
      // Show delete confirmation when reducing to 0
      setItemToDelete(productId);
      setIsMultipleDelete(false);
      setIsDeleteModalOpen(true);
      return;
    }
    const updatedItems = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedItems);
  };

  const handleDeleteItem = (productId, e) => {
    if (e) e.stopPropagation();
    setItemToDelete(productId);
    setIsMultipleDelete(false);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (isMultipleDelete) {
      // Handle bulk delete
      const updatedItems = cartItems.filter(
        (item) => !selectedItems.has(item.productId)
      );
      updateCart(updatedItems);
      setSelectedItems(new Set());
      setIsSelectionMode(false);
      toast.success("Selected items removed from cart");
    } else {
      // Handle single item delete
      const updatedItems = cartItems.filter(
        (item) => item.productId !== itemToDelete
      );
      updateCart(updatedItems);
      toast.success("Item removed from cart");
    }
    setIsDeleteModalOpen(false);
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
    setIsMultipleDelete(true);
    setIsDeleteModalOpen(true);
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

  // Helper function to safely format prices
  const formatPrice = (price) => {
    return typeof price === 'number' 
      ? price.toFixed(2) 
      : Number(price).toFixed(2);
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
      {/* Improved Header with 3-column layout */}
      <div className="p-4 mb-4 md:mb-8 sticky top-0 bg-white z-10 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left Column */}
          <div className="w-10">
            {isSelectionMode ? (
              <button
                onClick={exitSelectionMode}
                className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            ) : (
              <button 
                className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => router.back()}
              >
                <ChevronLeft size={24} />
              </button>
            )}
          </div>
          
          {/* Center Column - Title */}
          <div className="flex-1 text-center">
            {isSelectionMode ? (
              <span className="text-primarycolor font-medium inline-flex items-center">
                <span className="bg-primarycolor text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                  {selectedItems.size}
                </span>
                <span>Selected</span>
              </span>
            ) : (
              <h1 className="text-xl font-bold text-primarycolor">
                MY CART
              </h1>
            )}
          </div>
          
          {/* Right Column */}
          <div className="w-10">
            {!isSelectionMode && (
              <button
                onClick={() => setIsSelectionMode(true)}
                className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Select Items"
              >
                <CheckSquare size={20} />
              </button>
            )}
          </div>
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
                  className={`bg-secondaryvariant rounded-lg p-4 relative ${
                    isSelectionMode ? "cursor-pointer" : ""
                  } ${
                    selectedItems.has(item.productId)
                      ? "border-2 border-primarycolor"
                      : ""
                  }`}
                  onClick={() => toggleItemSelection(item.productId)}
                >
                  {/* Mobile Layout - 2-column with better spacing */}
                  <div className="flex md:hidden">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        width={96}
                        height={96}
                        className="object-cover rounded-lg w-full h-full"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="ml-4 flex-1 flex flex-col">
                      {/* Product Name */}
                      <h3 className="font-semibold text-primarycolor text-base mb-1 line-clamp-2">
                        {item.product.name}
                      </h3>
                      
                      {/* Price */}
                      <p className="font-bold text-purple-900 text-lg">
                        Ksh. {formatPrice(item.product.price * item.quantity)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div 
                        className="flex items-center mt-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center border border-primarycolor rounded-full h-8 mt-2">
                          {item.quantity === 1 ? (
                            <button
                              onClick={(e) => handleDeleteItem(item.productId, e)}
                              className="w-8 h-8 flex items-center justify-center text-warningcolor"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleQuantityChange(item.productId, item.quantity - 1, e)}
                              className="w-8 h-8 flex items-center justify-center text-primarycolor"
                            >
                              <Minus size={16} />
                            </button>
                          )}
                          <span className="w-8 text-center text-primarycolor">
                            {item.quantity}
                          </span>
                          <button
                            onClick={(e) => handleQuantityChange(item.productId, item.quantity + 1, e)}
                            className="w-8 h-8 flex items-center justify-center text-primarycolor"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout - Original layout preserved */}
                  <div className="hidden md:flex md:items-center">
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
                          {item.quantity === 1 ? (
                            <button
                              onClick={(e) => handleDeleteItem(item.productId, e)}
                              className="px-3 py-1 text-warningcolor font-bold"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleQuantityChange(item.productId, item.quantity - 1, e)}
                              className="px-3 py-1 text-primarycolor font-bold"
                            >
                              -
                            </button>
                          )}
                          <span className="px-3 py-1 text-primarycolor">
                            {item.quantity}
                          </span>
                          <button
                            onClick={(e) => handleQuantityChange(item.productId, item.quantity + 1, e)}
                            className="px-3 py-1 text-primarycolor font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end min-w-[100px]">
                      <p className="font-bold text-purple-900 whitespace-nowrap">
                        Ksh. {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Static Pricing & Checkout Section */}
          <div className="md:h-fit mt-6 md:mt-0">
            <div className="bg-gray-50 p-6 rounded-lg md:bg-transparent">
              <h2 className="text-xl font-bold text-primarycolor mb-6 md:hidden">Order Summary</h2>
              
              <div className="flex justify-between mb-4">
                <span className="font-medium text-primarycolor">Sub Total</span>
                <span className="
                font-medium text-primarycolor">
                  Ksh. {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between mb-4">
                {!deliveryCost ? (
                  <>
                    <button
                      onClick={handleAddDeliveryCost}
                      className="w-1/2 border-2 border-primarycolor text-primarycolor font-medium py-2 rounded-full"
                    >
                      Add Delivery Cost
                    </button>
                    <span className="text-primarycolor font-medium self-center">Ksh. 0</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-primarycolor">
                      Delivery Cost
                    </span>
                    <span className="font-medium text-primarycolor">
                      Ksh. {formatPrice(deliveryCost)}
                    </span>
                  </>
                )}
              </div>

              <div className="border-b border-primarycolor my-6"></div>

              <div className="flex justify-between mb-8">
                <span className="font-bold text-primarycolor text-lg">Total Cost</span>
                <span className="font-bold text-primarycolor text-lg">
                  Ksh. {formatPrice(totalCost)}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-warningcolor mr-2" size={24} />
              <h3 className="text-lg font-semibold text-primarycolor">
                {isMultipleDelete ? "Remove Selected Items?" : "Remove Item?"}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {isMultipleDelete 
                ? `Are you sure you want to remove ${selectedItems.size} items from your cart?` 
                : "Are you sure you want to remove this item from your cart?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-primarycolor"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-warningcolor text-white rounded-lg"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeliveryModalOpen && (
        <DeliveryModal
          onClose={() => setIsDeliveryModalOpen(false)}
          onSelect={handleDeliverySelection}
        />
      )}
    </div>
  );
}
