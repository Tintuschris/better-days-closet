"use client"
import { useEffect, useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export default function CartPage() {
  const { fetchCartItems } = useSupabase();
  const [cartItems, setCartItems] = useState([]);
  const userId = 1; // Replace with authenticated user ID

  useEffect(() => {
    fetchCartItems(userId).then(setCartItems);
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.total_amount), 0);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Cart</h1>
      {cartItems.map(item => (
        <div key={item.id} className="flex justify-between mb-4">
          <p>{item.product_name}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Ksh. {item.total_amount}</p>
        </div>
      ))}
      <div className="border-t border-gray-200 py-4">
        <p className="text-lg font-semibold">Subtotal: Ksh. {subtotal}</p>
        <button className="mt-4 bg-green-500 text-white px-4 py-2">Checkout</button>
      </div>
    </div>
  );
}
