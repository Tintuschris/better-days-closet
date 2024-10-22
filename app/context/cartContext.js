// contexts/CartContext.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Initialize cart from localStorage
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(savedCart);
      setCartCount(savedCart.reduce((acc, item) => acc + item.quantity, 0));
    };
    
    loadCart();
    window.addEventListener('storage', loadCart);
    
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const updateCart = (newCart) => {
    setCartItems(newCart);
    setCartCount(newCart.reduce((acc, item) => acc + item.quantity, 0));
    localStorage.setItem('cart', JSON.stringify(newCart));
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, updateCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);