"use client"
import { Menu, ShoppingCart, User, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export default function Header({ activeIcon, setActiveIcon }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { fetchCategories } = useSupabase();
  const [categories, setCategories] = useState([]);  // Initialize as an empty array
  const menuRef = useRef(null);  // To detect clicks outside of the menu

  // Fetch categories from Supabase
  useEffect(() => {
    fetchCategories().then(data => {
      console.log("Categories from Supabase:", data);  // Check the response
      if (data) {
        setCategories(data);
      } else {
        console.log("No categories found");
      }
    }).catch(error => {
      console.error("Failed to fetch categories:", error);
    });
  }, []);

  // Add this log to see how state is updated
  // console.log("Categories state:", categories);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="p-4 text-primarycolor bg-white shadow-md flex justify-between items-center">
      {/* Hamburger Menu Toggle */}
      <button onClick={() => setMenuOpen(!menuOpen)} className="text-center">
        {menuOpen ? (
          <X className="h-6 w-6 text-warningcolor" />
        ) : (
          <Menu className="h-6 w-6 text-primarycolor" />
        )}
      </button>

      {/* Logo */}
      <Link href="/">
        <Image src="/logo.png" alt="Better Days Closet" width={32} height={32} />
      </Link>

      {/* Icons */}
      <div className="flex space-x-4">
        {/* Shopping Cart Icon */}
        <button onClick={() => setActiveIcon('cart')} className="text-center">
          <Link href="/cart">
            <ShoppingCart className={`h-6 w-6 ${activeIcon === 'cart' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
          </Link>
        </button>

        {/* Profile Icon */}
        <button onClick={() => setActiveIcon('profile')} className="text-center">
          <Link href="/profile">
            <User className={`h-6 w-6 ${activeIcon === 'profile' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
          </Link>
        </button>
      </div>

      {/* Hamburger Menu - Categories */}
      {menuOpen && (
        <nav ref={menuRef} className="absolute left-0 top-16 text-primarycolor bg-secondarycolor w-full shadow-md">
          <ul className="p-4">
            {categories.length > 0 ? (
              categories.map(category => (
                <li key={category.id} className="py-2">
                  <Link href={`/categories/${category.name}`}>
                    {category.name}
                  </Link>
                </li>
              ))
            ) : (
              <li>No categories available</li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
