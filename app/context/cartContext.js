// contexts/CartContext.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();
  const [deliveryCost, setDeliveryCost] = useState(null);
  
  useEffect(() => {
    const initializeCart = async () => {
      // First check localStorage
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      
      // If user is logged in and localStorage is empty, fetch from DB
      if (user && localCart.length === 0) {
        const { data: dbCart } = await supabase
          .from('cart')
          .select('*, products(*)')
          .eq('user_id', user.id);
          
        if (dbCart && dbCart.length > 0) {
          const formattedCart = dbCart.map(item => ({
            productId: item.product_id,
            quantity: item.quantity,
            product: item.products
          }));
          
          setCartItems(formattedCart);
          setCartCount(formattedCart.reduce((acc, item) => acc + item.quantity, 0));
          localStorage.setItem('cart', JSON.stringify(formattedCart));
          return;
        }
      }
      
      // Use localStorage cart if DB fetch fails or user is not logged in
      setCartItems(localCart);
      setCartCount(localCart.reduce((acc, item) => acc + item.quantity, 0));
    };

    initializeCart();
  }, [user]);

  const updateCart = async (newCart) => {
    // Calculate totals for each item
    const cartWithTotals = newCart.map(item => ({
      ...item,
      total_amount: item.quantity * item.product.price
    }));

    // Update local state and localStorage
    setCartItems(cartWithTotals);
    setCartCount(cartWithTotals.reduce((acc, item) => acc + item.quantity, 0));
    localStorage.setItem('cart', JSON.stringify(cartWithTotals));
  
    // If user is authenticated, sync with database
    if (user) {
      // Clear existing cart items for user
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);
      
      // Insert new cart items with total_amount
      if (cartWithTotals.length > 0) {
        const dbCartItems = cartWithTotals.map(item => ({
          user_id: user.id,
          product_id: item.productId,
          quantity: item.quantity,
          total_amount: item.total_amount
        }));
      
        await supabase
          .from('cart')
          .insert(dbCartItems);
      }
    }

    window.dispatchEvent(new Event('cartUpdated'));
  };
  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartCount, 
      updateCart, 
      deliveryCost, 
      setDeliveryCost 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);