"use client";
import { Suspense, useState, useEffect } from 'react';
import { AlignLeft, ShoppingCart, User, Heart, Search, X, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  const { categories, user, wishlistItems, products } = useSupabaseContext();
  const { cartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isCartActive = pathname === '/cart';
  const isProfileActive = pathname === '/profile' || pathname.startsWith('/profile/');
  const isWishlistActive = pathname === '/wishlist';

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsLoading(true);

    if (value.trim()) {
      const filtered = products?.filter(
        (product) =>
          product.name.toLowerCase().includes(value.toLowerCase()) ||
          product.category_name.toLowerCase().includes(value.toLowerCase())
      ) || [];
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(true);
    }
    setIsLoading(false);
  };

  const handleSearch = (term = searchTerm) => {
    // Save to recent searches
    const updatedSearches = [
      term,
      ...recentSearches.filter((s) => s !== term),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    setShowSuggestions(false);
  };

  return (
    <>
      <header className="relative z-50 p-4 bg-white shadow-md">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center">
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
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <Link href="/" prefetch className="flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Better Days Closet" 
              width={40} 
              height={40} 
              priority
            />
          </Link>

          <div className="flex items-center justify-end flex-1 ml-8 space-x-8">
            {/* Search Bar with Dropdown */}
            <div className="relative flex items-center w-1/2">
              <div className="relative flex items-center w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full py-2 pl-10 pr-4 text-sm border-2 border-primarycolor rounded-full focus:outline-none"
                />
                <Search className="absolute left-3 w-5 h-5 text-primarycolor" />
                {isLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-primarycolor border-t-transparent rounded-full" />
                  </div>
                )}
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-primarycolor rounded-lg shadow-lg z-50">
                  {searchTerm === "" && recentSearches.length > 0 && (
                    <div className="p-2">
                      <h3 className="text-sm font-medium text-primarycolor mb-2">Recent Searches</h3>
                      {recentSearches.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchTerm(term);
                            handleSearch(term);
                          }}
                          className="flex items-center w-full p-2 hover:bg-gray-50 rounded-lg"
                        >
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-primarycolor">{term}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                        </button>
                      ))}
                    </div>
                  )}

                  {suggestions.length > 0 && (
                    <div className="max-h-[400px] overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <Link
                          key={index}
                          href={`/product/${suggestion.id}`}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            handleSearch(suggestion.name);
                            setShowSuggestions(false);
                          }}
                        >
                          <Image
                            src={suggestion.image_url}
                            alt={suggestion.name}
                            width={40}
                            height={40}
                            className="rounded-md mr-3"
                          />
                          <div>
                            <p className="text-primarycolor font-medium">
                              {suggestion.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {suggestion.category_name}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              <Link href="/cart" prefetch className="relative">
                <ShoppingCart className={`h-6 w-6 transition-colors duration-200 ${isCartActive ? "text-secondarycolor" : "text-primarycolor"}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-warningcolor text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link href="/wishlist" prefetch className="relative">
                <Heart className={`h-6 w-6 transition-colors duration-200 ${isWishlistActive ? "text-secondarycolor" : "text-primarycolor"}`} />
                {wishlistItems?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-warningcolor text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link href={user ? "/profile" : "/auth/login"} prefetch>
                <User className={`h-6 w-6 transition-colors duration-200 ${isProfileActive ? "text-secondarycolor" : "text-primarycolor"}`} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-30 md:hidden
          ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
      />

      <nav 
        className={`fixed z-40 left-0 text-primarycolor bg-secondarycolor w-full shadow-md md:hidden
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
