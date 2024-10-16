"use client";
import { AlignLeft, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSupabase } from "../hooks/useSupabase";
import { useAuth } from "../hooks/useAuth";

export default function Header({ activeIcon, setActiveIcon }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { fetchCategories } = useSupabase();
  const [categories, setCategories] = useState([]);
  const menuRef = useRef(null);
  const { user } = useAuth();

  // Local cart state
  const [cartCount, setCartCount] = useState(0);

  // Fetch categories using useCallback
  const getCategories = useCallback(() => {
    fetchCategories()
      .then((data) => {
        console.log("Categories from Supabase:", data);
        if (data) {
          setCategories(data);
        } else {
          console.log("No categories found");
        }
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
  }, [fetchCategories]);

  // Fetch categories on component mount
  useEffect(() => {
    getCategories();
  }, [getCategories]);

  // Retrieve cart items from localStorage
  const updateCartCount = useCallback(() => {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(totalItems);
  }, []);

  useEffect(() => {
    updateCartCount(); // Set initial cart count
  }, [updateCartCount]);

  // Handle cart change in localStorage
  useEffect(() => {
    const handleCartUpdate = () => {
      updateCartCount(); // Update cart count when local storage changes
    };

    window.addEventListener("storage", handleCartUpdate);
    return () => {
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, [updateCartCount]);

  // Close menu when clicking outside
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
    <header className="p-4 text-primarycolor bg-white shadow-md flex justify-between items-center">
      {/* Hamburger Menu Toggle */}
      <button onClick={() => setMenuOpen(!menuOpen)} className="text-center">
        {menuOpen ? <X className="h-6 w-6 text-warningcolor" /> : <AlignLeft className="h-6 w-6 text-primarycolor" />}
      </button>

      {/* Logo */}
      <Link href="/">
        <Image src="/logo.png" alt="Better Days Closet" width={32} height={32} />
      </Link>

      {/* Icons */}
      <div className="relative flex space-x-4">
        {/* Shopping Cart Icon */}
        <button onClick={() => setActiveIcon("cart")} className="relative text-center">
          <Link href="/cart">
            <ShoppingCart className={`h-6 w-6 ${activeIcon === "cart" ? "text-secondarycolor" : "text-primarycolor"}`} />
          </Link>

          {/* Badge for Cart Item Count */}
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-warningcolor text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        {/* Profile Icon */}
        <button onClick={() => setActiveIcon("profile")} className="text-center">
          <Link href={user ? "/profile" : "/auth/login"}>
            <User className={`h-6 w-6 ${activeIcon === "profile" ? "text-secondarycolor" : "text-primarycolor"}`} />
          </Link>
        </button>
      </div>

      {/* Hamburger Menu - Categories */}
      {menuOpen && (
        <nav ref={menuRef} className="absolute left-0 top-16 text-primarycolor bg-secondarycolor w-full shadow-md">
          <ul className="p-4">
            {categories.length > 0 ? (
              categories.map((category) => (
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
