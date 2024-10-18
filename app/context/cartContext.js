'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return action.payload;
    case 'UPDATE_ITEM':
      return state.map(item => 
        item.product_id === action.payload.product_id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
    case 'REMOVE_ITEM':
      return state.filter(item => item.product_id !== action.payload);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const { addToCart, fetchCartItems } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        const dbCart = await fetchCartItems(user.id);
        dispatch({ type: 'SET_CART', payload: dbCart });
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        dispatch({ type: 'SET_CART', payload: localCart });
      }
    };
    loadCart();
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const updateCartItem = async (product, quantity) => {
    if (quantity < 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: product.product_id });
    } else {
      dispatch({ 
        type: 'UPDATE_ITEM', 
        payload: { ...product, quantity } 
      });
    }

    if (user) {
      const timeoutId = setTimeout(() => {
        addToCart(user.id, product.product_id, quantity);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <CartContext.Provider value={{ cart, dispatch, updateCartItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);