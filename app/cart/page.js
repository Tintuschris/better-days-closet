"use client"
import React, { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';

export default function CartPage() {
  const { fetchCartItems: originalFetchCartItems } = useSupabase();
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();
  const router = useRouter();

  const fetchCartItems = useCallback(() => {
    if (user) {
      return originalFetchCartItems(user.id);
    } else {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      return Promise.resolve(localCart);
    }
  }, [originalFetchCartItems, user]);

  useEffect(() => {
    fetchCartItems().then(setCartItems);
  }, [fetchCartItems]);

  const subtotal = cartItems.reduce((acc, item) => {
    const itemPrice = user ? parseFloat(item.total_amount) : (item.price * item.quantity);
    return acc + itemPrice;
  }, 0);

  return (
    <div className="p-4 min-h-screen bg-white">
      <div className="flex items-center mb-4">
        <ArrowLeft className="text-purple-700" />
        <h1 className="text-2xl font-bold text-purple-700 ml-4">MY CART</h1>
        <div className="ml-auto relative">
          <div className="bg-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs absolute -top-2 -right-2">
            {cartItems.length}
          </div>

          <Image src="/api/placeholder/24/24" alt="Cart icon" width={24} height={24} />
        </div>
      </div>

      {cartItems.map((item) => (
        <div key={item.id || item.productId} className="bg-pink-100 rounded-lg p-4 mb-4 flex items-center">

          <Image src="/api/placeholder/80/80" alt={item.product_name || item.name} width={80} height={80} className="object-cover rounded-lg mr-4" />
          <div className="flex-grow">
            <p className="font-semibold">{item.product_name || item.name}</p>
            <div className="flex items-center mt-2">
              <button className="text-purple-700"><Minus size={20} /></button>
              <span className="mx-2">{item.quantity}</span>
              <button className="text-purple-700"><Plus size={20} /></button>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className="font-bold">Ksh. {user ? item.total_amount : (item.price * item.quantity).toFixed(2)}</p>
            <button className="text-red-500 mt-2"><Trash2 size={20} /></button>
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
          onClick={() => user ? console.log("Proceed to checkout") : router.push('/auth/login')}
        >
          {user ? "Checkout" : "Login to Checkout"}
        </button>
      </div>
    </div>
  );
}