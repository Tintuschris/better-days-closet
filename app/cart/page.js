"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingCart, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useCart } from "../context/cartContext";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { useSupabase } from "../hooks/useSupabase"; 
import { useSupabaseContext } from "../context/supabaseContext"; 

export default function CartPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const { cartItems, updateCart } = useCart();
  const [cartWithDetails, setCartWithDetails] = useState([]);
  const { getCurrentUserAddress } = useSupabase();
  const { deliveryAddress, deliveryCost, setDeliveryCost } = useSupabaseContext();

  useEffect(() => {
    const loadSavedDeliveryDetails = async () => {
      if (user) {
        const savedAddress = await getCurrentUserAddress(user.id);
        if (savedAddress && savedAddress.cost) {
          setDeliveryCost(Number(savedAddress.cost));
        }
      }
    };

    loadSavedDeliveryDetails();
  }, [user, getCurrentUserAddress, setDeliveryCost]);
  useEffect(() => {
    setCartWithDetails(cartItems);
    setIsLoading(false);
  }, [cartItems, deliveryAddress, deliveryCost]);
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItems = cartItems.map(item => 
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedItems);
  };

  const handleAddDeliveryCost = () => {
    if (deliveryAddress && deliveryCost) {
      setDeliveryCost(deliveryCost);
    }
    router.push("/profile?tab=delivery");
  };

  const handleRemoveItem = (productId) => {
    const updatedItems = cartItems.filter(item => item.productId !== productId);
    updateCart(updatedItems);
  };

  const subtotal = cartWithDetails.reduce((acc, item) => {
    return acc + (item.product.price * item.quantity);
  }, 0);

  const totalCost = subtotal + (deliveryCost || 0);

  const handleCheckout = () => {
    if (!deliveryCost) {
      toast.error("Add Delivery Cost to Continue", {
        description: "Please add your delivery address before proceeding to checkout",
        duration: 3000,
        position: "top-right"
      });
      return;
    }
    router.push("/checkout");
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 min-h-screen bg-white pb-48"> {/* Added pb-48 for bottom spacing */}
      <div className="flex items-center justify-between mb-4 relative">
        <ChevronLeft 
          className="text-primarycolor cursor-pointer" 
          onClick={() => router.back()} 
        />
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-primarycolor">
          MY CART
        </h1>
        <div className="relative">
          <div className="bg-warningcolor rounded-full w-6 h-6 flex items-center justify-center text-white text-xs absolute -top-2 -right-2">
            {cartItems.length}
          </div>
          <ShoppingCart className="text-primarycolor"/>
        </div>
      </div>

      {cartWithDetails.map((item) => (        <div key={item.productId} className="bg-secondaryvariant rounded-lg p-4 mb-4 flex items-center">
          <Image
            src={item.product.image_url}
            alt={item.product.name}
            width={80}
            height={80}
            className="object-cover rounded-lg mr-4"
          />
          <div className="flex-grow">
            <p className="font-semibold text-primarycolor">{item.product.name}</p>
            <div className="flex items-center mt-2">
              <div className="flex items-center px-3 py-1 bg-transparent border border-primarycolor rounded-full">
                <button
                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                  className="px-3 py-1 text-primarycolor font-bold"
                >
                  -
                </button>
                <span className="px-3 py-1 text-primarycolor">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                  className="px-3 py-1 text-primarycolor font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end min-w-[100px]"> {/* Added min-width to prevent wrapping */}
            <button 
              className="text-red-500 mb-6" 
              onClick={() => handleRemoveItem(item.productId)}
            >
              <Trash2 size={20} />
            </button>
            <p className="font-bold text-purple-900 whitespace-nowrap"> {/* Added whitespace-nowrap to prevent line breaks */}
              Ksh. {(item.product.price * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      ))}
        <div className="mt-6">
          <div className="flex justify-between mb-8">
            <span className="font-medium text-primarycolor">Sub Total</span>
            <span className="font-medium text-primarycolor">Ksh. {subtotal.toFixed(2)}</span>
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
                <span className="font-medium text-primarycolor">Delivery Cost</span>
                <span className="font-medium text-primarycolor">Ksh. {deliveryCost.toFixed(2)}</span>
              </>
            )}
          </div>

          {/* Added border separator with spacing */}
          <div className="border-b border-primarycolor my-8"></div>

          <div className="flex justify-between mb-8">
            <span className="font-bold text-primarycolor">Total Cost</span>
            <span className="font-bold text-primarycolor">Ksh. {totalCost.toFixed(2)}</span>
          </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
          <button
            className={`w-full py-3 rounded-full ${
              deliveryCost 
                ? 'bg-primarycolor text-white hover:bg-primarycolor' 
                : 'bg-primarycolor/50 text-white'
            }`}
            onClick={() => {
              if (!deliveryCost) {
                toast.error("Add Delivery Cost to Continue", {
                  description: "Please add your delivery address before proceeding to checkout",
                  duration: 3000,
                  position: "bottom-center",
                })
                return
              }
              router.push("/checkout")
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}