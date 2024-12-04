"use client";
import { AlignLeft, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSupabaseContext } from "../context/supabaseContext";
import { useCart } from '../context/cartContext';

export default function Header({ activeIcon, setActiveIcon }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { categories, user } = useSupabaseContext();
  const menuRef = useRef(null);
  const { cartCount } = useCart();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

        <Link href="/">
          <Image src="/logo.png" alt="Better Days Closet" width={32} height={32} />
        </Link>

        <div className="relative flex space-x-4">
          <button onClick={() => setActiveIcon("cart")} className="relative text-center">
            <Link href="/cart">
              <ShoppingCart className={`h-6 w-6 transition-colors duration-200 ${activeIcon === "cart" ? "text-secondarycolor" : "text-primarycolor"}`} />
            </Link>

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-warningcolor text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button onClick={() => setActiveIcon("profile")} className="text-center">
            <Link href={user ? "/profile" : "/auth/login"}>
              <User className={`h-6 w-6 transition-colors duration-200 ${activeIcon === "profile" ? "text-secondarycolor" : "text-primarycolor"}`} />
            </Link>
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-30
          ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Menu */}
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