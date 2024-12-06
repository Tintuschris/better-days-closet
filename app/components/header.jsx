"use client";
import { Suspense } from 'react';
import { AlignLeft, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from 'next/navigation';
import { useSupabaseContext } from "../context/supabaseContext";
import { useCart } from '../context/cartContext';

export default function Header({ activeIcon, setActiveIcon }) {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderContent activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
    </Suspense>
  );
}

function HeaderSkeleton() {
  return (
    <header className="relative z-50 p-4 bg-white shadow-md flex justify-between items-center">
      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      <div className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
    </header>
  );
}

function HeaderContent({ activeIcon, setActiveIcon }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { categories, user } = useSupabaseContext();
  const menuRef = useRef(null);
  const { cartCount } = useCart();

  const isCartActive = pathname === '/cart';
  const isProfileActive = pathname === '/profile' || pathname.startsWith('/profile/');

  const handleClickOutside = useCallback((event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Prefetch category pages
  useEffect(() => {
    categories?.forEach(category => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/categories/${category.name}`;
      document.head.appendChild(link);
    });
  }, [categories]);

  return (
    <>
      <header className="relative z-50 p-4 text-primarycolor bg-white shadow-md flex justify-between items-center">
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="text-center transition-transform duration-200 ease-in-out hover:scale-110"
        >
          {menuOpen ? 
            <X className="h-6 w-6 text-warningcolor transition-all duration-200 ease-in-out" /> : 
            <AlignLeft className="h-6 w-6 text-primarycolor transition-all duration-200 ease-in-out" />
          }
        </button>

        <Link href="/" prefetch>
          <Image 
            src="/logo.png" 
            alt="Better Days Closet" 
            width={32} 
            height={32} 
            priority
          />
        </Link>

        <div className="relative flex space-x-4">
          <Link href="/cart" prefetch className="relative">
            <ShoppingCart className={`h-6 w-6 transition-colors duration-200 ${isCartActive ? "text-secondarycolor" : "text-primarycolor"}`} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-warningcolor text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <Link href={user ? "/profile" : "/auth/login"} prefetch>
            <User className={`h-6 w-6 transition-colors duration-200 ${isProfileActive ? "text-secondarycolor" : "text-primarycolor"}`} />
          </Link>
        </div>
      </header>

      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-30
          ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
      />

      <nav 
        ref={menuRef} 
        className={`fixed z-40 left-0 text-primarycolor bg-secondarycolor w-full shadow-md
          transition-all duration-300 ease-in-out
          ${menuOpen ? 'top-16' : '-top-[100%]'}
          max-h-[calc(100vh-4rem)] overflow-y-auto`}
      >
        <ul className="p-4">
          {categories?.map((category) => (
            <li 
              key={category.id} 
              className="py-2 border-b border-white/20 last:border-b-0 transition-colors duration-200 hover:bg-white/10"
            >
              <Link 
                href={`/categories/${category.name}`}
                className="block w-full"
                onClick={() => setMenuOpen(false)}
                prefetch
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
