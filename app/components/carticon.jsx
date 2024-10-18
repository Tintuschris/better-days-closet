'use client';
import { useCart } from '../context/cartContext';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CartIcon() {
  const { cart } = useCart();
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <Link href="/cart" className="relative">
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-purple-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
