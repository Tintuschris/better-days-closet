// contexts/CartContext.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [deliveryCost, setDeliveryCost] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const initializeCart = async () => {
      // First check localStorage
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      const guestDelivery = JSON.parse(localStorage.getItem('guestDeliveryDetails'));
      
      if (user) {
        // If user is logged in and localStorage is empty, fetch from DB
        if (localCart.length === 0) {
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
      } else if (guestDelivery) {
        setDeliveryCost(Number(guestDelivery.cost));
      }
      
      setCartItems(localCart);
      setCartCount(localCart.reduce((acc, item) => acc + item.quantity, 0));
    };

    initializeCart();
  }, [user]);

  const updateCart = async (newCart) => {
    const cartWithTotals = newCart.map(item => ({
      ...item,
      total_amount: item.quantity * item.product.price
    }));

    setCartItems(cartWithTotals);
    setCartCount(cartWithTotals.reduce((acc, item) => acc + item.quantity, 0));
    localStorage.setItem('cart', JSON.stringify(cartWithTotals));
  
    if (user) {
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);
      
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