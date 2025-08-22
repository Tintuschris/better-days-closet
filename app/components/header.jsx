"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import {
  Bars3Icon as AlignLeft,
  ShoppingCartIcon as ShoppingCart,
  UserIcon as User,
  HeartIcon as Heart,
  MagnifyingGlassIcon as Search,
  XMarkIcon as X,
  ClipboardDocumentListIcon as Orders,
  ArrowRightIcon as ArrowRight,
  PhoneIcon as Phone,
  // Quick actions - Keep from Heroicons
  StarIcon as Popular,
  TagIcon as Sale,
  RocketLaunchIcon as New,
} from "@heroicons/react/24/outline";
// Lucide React for specific product icons
import {
  Shirt as WomenIcon,      // Better for women's clothing/dresses
  Shirt as MenIcon,        // Better for men's clothing/shirts/trousers  
  Baby as KidsIcon,        // Perfect for kids/baby items
  Footprints as ShoesIcon, // Perfect for shoes/footwear
  ShoppingBag as HandbagsIcon, // Perfect for handbags/purses
  Tv as ElectronicsIcon,   // Perfect for electronics/TV
  ChefHat as KitchenwareIcon, // Perfect for kitchen/cooking
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSupabaseContext } from "../context/supabaseContext";
import { useCart } from "../context/cartContext";

export default function Header({ activeIcon, setActiveIcon }) {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderContent activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
    </Suspense>
  );
}

function HeaderSkeleton() {
  return (
    <header className="relative z-50 px-4 py-3 bg-white shadow-sm flex justify-between items-center">
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
  const searchRef = useRef(null);

  // Smart icon mapping for your specific categories using Lucide icons
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    const iconMap = {
      'women': WomenIcon,        // 👗 Shirt - perfect for women's clothing/dresses
      'men': MenIcon,            // 👔 Shirt - perfect for men's clothing/trousers
      'kids': KidsIcon,          // 👶 Baby - perfect for kids/baby items
      'shoes': ShoesIcon,        // 👟 Footprints - perfect for shoes/footwear
      'handbags': HandbagsIcon,  // 👜 ShoppingBag - perfect for handbags/purses
      'electronics': ElectronicsIcon, // 📺 TV - perfect for electronics/tech
      'kitchenware': KitchenwareIcon, // 👨‍🍳 ChefHat - perfect for kitchen/cooking items
    };
    return iconMap[name] || ShoppingCart; // Default fallback to Heroicon
  };

  const isCartActive = pathname === "/cart";
  const isProfileActive =
    pathname === "/profile" || pathname.startsWith("/profile/");
  const isWishlistActive = pathname === "/wishlist";

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Handle clicks outside of search area to close suggestions
    function handleClickOutside(event) {
      // Check if we're on mobile (window width check)
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // For mobile, only close if clicking outside the entire mobile search overlay
        const mobileSearchOverlay = event.target.closest('[data-mobile-search="true"]');
        const searchButton = event.target.closest('button[data-search-trigger="true"]');
        
        if (!mobileSearchOverlay && !searchButton) {
          setShowSuggestions(false);
        }
      } else {
        // For desktop, use the existing logic
        if (searchRef.current && !searchRef.current.contains(event.target)) {
          setShowSuggestions(false);
        }
      }
    }

    // Only add listener when suggestions are shown
    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      setIsLoading(true);
      // Add a small delay to improve UX
      setTimeout(() => {
        const filtered =
          products?.filter(
            (product) =>
              product.name.toLowerCase().includes(value.toLowerCase()) ||
              product.category_name.toLowerCase().includes(value.toLowerCase()) ||
              product.description?.toLowerCase().includes(value.toLowerCase())
          ) || [];
        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(true);
        setIsLoading(false);
      }, 200);
    } else {
      setSuggestions([]);
      setShowSuggestions(true);
      setIsLoading(false);
    }
  };

  const handleSearch = (term = searchTerm) => {
    if (term.trim()) {
      const newSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(newSearches);
      localStorage.setItem("recentSearches", JSON.stringify(newSearches));
      window.location.href = `/search?q=${encodeURIComponent(term)}`;
    }
  };

  return (
    <>
      {/* Top bar - Desktop only */}
      <div className="hidden md:block bg-primarycolor text-white py-2 px-4">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          {/* Contact Info & Social Links */}
          <div className="flex items-center space-x-6 z-10 bg-primarycolor pr-4 w-1/3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondarycolor transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondarycolor transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://wa.me/yourphonenumber"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondarycolor transition-colors"
            >
              <Phone className="w-[18px] h-[18px]" />
            </a>

            {/* Divider */}
            <div className="h-4 w-px bg-white/30 mx-2"></div>
            <Link
              href="/track-order"
              className="flex items-center space-x-1 hover:text-secondarycolor transition-colors text-sm font-medium"
            >
              <Orders className="w-4 h-4" />
              <span>Orders</span>
            </Link>
          </div>

          {/* Marquee Banner */}
          <div className="overflow-hidden flex-1 relative">
            <div className="whitespace-nowrap animate-marquee">
              🌟 Free shipping on orders over Ksh. 5,000! Shop now and enjoy
              exclusive deals on our latest arrivals! 🌟
            </div>
          </div>
        </div>
      </div>

      <header className="relative z-40 px-4 py-3 bg-white shadow-sm border-b border-gray-100">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center">
          {/* Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 -ml-2 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-50 active:scale-95"
          >
            <div className="relative w-5 h-5 flex flex-col justify-center">
              <span
                className={`block h-0.5 w-5 bg-primarycolor transition-all duration-300 ease-in-out ${
                  menuOpen ? 'rotate-45 translate-y-0.5' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-primarycolor transition-all duration-300 ease-in-out mt-1 ${
                  menuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-primarycolor transition-all duration-300 ease-in-out mt-1 ${
                  menuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </div>
          </button>

          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/" prefetch>
              <Image
                src="/logo.png"
                alt="Better Days Closet"
                width={36}
                height={36}
                priority
                className="transition-transform duration-200 hover:scale-105"
              />
            </Link>
          </div>

          {/* Cart & Search Icons */}
          <div className="flex items-center space-x-1">
            <Link href="/cart" prefetch className="relative p-2 rounded-full transition-all duration-200 hover:bg-secondarycolor/10 active:scale-95">
              <ShoppingCart
                className={`h-5 w-5 transition-colors duration-200 ${
                  isCartActive ? "text-secondarycolor" : "text-primarycolor"
                }`}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-warningcolor text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setShowSuggestions(true)}
              data-search-trigger="true"
              className="p-2 rounded-full transition-all duration-200 hover:bg-secondarycolor/10 active:scale-95"
            >
              <Search className="h-5 w-5 text-primarycolor" />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between py-2">
          {/* Logo & Welcome Message */}
          <div className="flex items-center space-x-6">
            <Link href="/" prefetch className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Better Days Closet"
                width={44}
                height={44}
                priority
                className="transition-transform duration-200 hover:scale-105"
              />
            </Link>

            {user && (
              <div>
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="text-lg font-medium text-primarycolor">
                  {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end flex-1 ml-8 space-x-6">
            {/* Search Bar */}
            <div className="relative flex items-center w-1/2 max-w-md" ref={searchRef}>
              <div className="relative flex items-center w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-primarycolor transition-all duration-200">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full py-3 pl-4 pr-12 text-sm bg-transparent border-0 focus:outline-none placeholder-gray-400"
                />
                <button
                  onClick={() => handleSearch()}
                  className="absolute right-2 p-2 rounded-lg bg-primarycolor text-white hover:bg-primarycolor/90 transition-all duration-200 active:scale-95"
                >
                  <Search className="w-4 h-4" />
                </button>
                {isLoading && (
                  <div className="absolute right-14 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-primarycolor border-t-transparent rounded-full" />
                  </div>
                )}
              </div>

              {/* Desktop Search Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                      {searchTerm ? "Search Results" : "Recent Searches"}
                    </h3>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="p-2 rounded-xl text-gray-400 hover:text-primarycolor hover:bg-white transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {searchTerm === "" && recentSearches.length > 0 && (
                    <div className="p-3">
                      {recentSearches.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchTerm(term);
                            handleSearch(term);
                          }}
                          className="flex items-center w-full p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                        >
                          <Orders className="w-4 h-4 text-gray-400 mr-3 group-hover:text-primarycolor transition-colors" />
                          <span className="text-gray-700 font-medium group-hover:text-primarycolor transition-colors">{term}</span>
                          <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-primarycolor transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Loading state for desktop search */}
                  {isLoading && searchTerm && (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-primarycolor/10 rounded-full flex items-center justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primarycolor border-t-transparent rounded-full" />
                      </div>
                      <p className="text-gray-600 font-medium">Searching for "{searchTerm}"...</p>
                    </div>
                  )}

                  {suggestions.length > 0 && !isLoading && (
                    <>
                      <div className="max-h-[320px] overflow-y-auto">
                        {suggestions.slice(0, 4).map((suggestion, index) => (
                          <Link
                            key={index}
                            href={`/product/${suggestion.id}`}
                            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-b border-gray-50 last:border-b-0 group"
                            onClick={() => {
                              setShowSuggestions(false);
                              handleSearch(searchTerm);
                            }}
                          >
                            <div className="relative">
                              <Image
                                src={suggestion.image_url}
                                alt={suggestion.name}
                                width={52}
                                height={52}
                                className="rounded-xl object-cover shadow-sm"
                              />
                            </div>
                            <div className="flex-1 ml-4">
                              <p className="text-gray-900 font-semibold text-sm group-hover:text-primarycolor transition-colors">
                                {suggestion.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {suggestion.category_name} • Ksh {suggestion.price}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primarycolor transition-colors" />
                          </Link>
                        ))}
                      </div>

                      {/* View All Results Button */}
                      <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <Link
                          href={`/search?q=${encodeURIComponent(searchTerm)}`}
                          className="flex items-center justify-center w-full p-3 bg-gradient-to-r from-primarycolor to-secondarycolor text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                          onClick={() => setShowSuggestions(false)}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          View all {suggestions.length > 4 ? suggestions.length : ''} results
                        </Link>
                      </div>
                    </>
                  )}

                  {searchTerm && suggestions.length === 0 && (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-500 mb-4">We couldn&apos;t find anything for &quot;{searchTerm}&quot;</p>
                      <Link
                        href={`/search?q=${encodeURIComponent(searchTerm)}`}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primarycolor to-secondarycolor text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search all products
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
              <Link
                href="/cart"
                prefetch
                className="relative flex items-center px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="relative">
                  <ShoppingCart
                    className={`h-5 w-5 transition-colors duration-200 ${
                      isCartActive ? "text-secondarycolor" : "text-primarycolor"
                    } group-hover:text-secondarycolor`}
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-warningcolor text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-primarycolor group-hover:text-secondarycolor transition-colors">
                  Cart
                </span>
              </Link>

              <Link
                href="/wishlist"
                prefetch
                className="relative flex items-center px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="relative">
                  <Heart
                    className={`h-5 w-5 transition-colors duration-200 ${
                      isWishlistActive
                        ? "text-secondarycolor"
                        : "text-primarycolor"
                    } group-hover:text-secondarycolor`}
                  />
                  {wishlistItems?.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-warningcolor text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                    </span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-primarycolor group-hover:text-secondarycolor transition-colors">
                  Wishlist
                </span>
              </Link>

              <Link
                href={user ? "/profile" : "/auth/login"}
                prefetch
                className="flex items-center px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <User
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isProfileActive ? "text-secondarycolor" : "text-primarycolor"
                  } group-hover:text-secondarycolor`}
                />
                <span className="ml-2 text-sm font-medium text-primarycolor group-hover:text-secondarycolor transition-colors">
                  {user ? "Profile" : "Login"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-30 md:hidden
          ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMenuOpen(false)}
      />

      <nav
        className={`fixed z-40 left-0 text-primarycolor bg-white w-full shadow-xl md:hidden border-b border-gray-200
          transition-all duration-300 ease-in-out
          ${menuOpen ? "top-[72px]" : "-top-[100%]"}
          max-h-[calc(100vh-72px)] overflow-y-auto`}
      >
        {/* Search Section */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => {
              setMenuOpen(false);
              setShowSuggestions(true);
            }}
            className="w-full flex items-center px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
          >
            <Search className="w-5 h-5 text-gray-500 mr-3" />
            <span className="text-gray-500 font-medium">Search products...</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Quick Access</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/new-arrivals"
              className="flex items-center px-3 py-2 bg-gradient-to-r from-primarycolor/5 to-secondarycolor/5 rounded-xl hover:from-primarycolor/10 hover:to-secondarycolor/10 transition-all duration-200"
              onClick={() => setMenuOpen(false)}
            >
              <New className="w-4 h-4 text-primarycolor mr-2" />
              <span className="text-sm font-medium text-primarycolor">New Arrivals</span>
            </Link>
            <Link
              href="/top-deals"
              className="flex items-center px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all duration-200"
              onClick={() => setMenuOpen(false)}
            >
              <Sale className="w-4 h-4 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-orange-600">Top Deals</span>
            </Link>
          </div>
        </div>

        {/* Categories Section */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-primarycolor mb-3">Shop by Category</h3>
          <div className="grid grid-cols-1 gap-1">
            {categories?.map((category) => {
              const IconComponent = getCategoryIcon(category.name);
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.name}`}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                  onClick={() => setMenuOpen(false)}
                  prefetch
                >
                  <IconComponent className="w-5 h-5 text-primarycolor mr-3 group-hover:text-secondarycolor transition-colors" />
                  <span className="text-primarycolor font-medium group-hover:text-secondarycolor transition-colors capitalize">{category.name}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-secondarycolor transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Help & Support Section */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Support</h3>
          <div className="space-y-1">
            <a
              href="tel:+254700000000"
              className="flex items-center px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors duration-200"
            >
              <Phone className="w-4 h-4 text-primarycolor mr-3" />
              <span className="text-primarycolor font-medium">Contact Us</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Search - Slides down below header with prominent input */}
      <div 
        data-mobile-search="true"
        onClick={(e) => e.stopPropagation()}
        className={`md:hidden fixed left-0 right-0 bg-white shadow-lg border-b border-gray-100 z-40 transition-all duration-300 ease-in-out ${
          showSuggestions ? 'top-[72px] opacity-100' : '-top-full opacity-0'
        }`}
      >
        {/* Search Input Section - More Prominent */}
        <div className="p-4 bg-gradient-to-r from-primarycolor/5 to-secondarycolor/5 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSuggestions(false)}
              className="p-2 rounded-xl hover:bg-white/50 transition-colors duration-200 flex-shrink-0"
            >
              <X className="w-5 h-5 text-primarycolor" />
            </button>
            <div className="flex-1 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, categories..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full py-4 pl-5 pr-12 bg-white border-2 border-primarycolor/20 rounded-2xl focus:outline-none focus:border-primarycolor focus:ring-4 focus:ring-primarycolor/10 transition-all duration-200 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm"
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-primarycolor border-t-transparent rounded-full" />
                  ) : (
                    <Search className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section - Improved styling and UX */}
        <div className="max-h-[60vh] overflow-y-auto bg-white">
          {/* Show helpful hint when search is empty */}
          {searchTerm === "" && recentSearches.length === 0 && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-primarycolor" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
              <p className="text-gray-500">Type to find products, categories, and more</p>
            </div>
          )}

          {searchTerm === "" && recentSearches.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Recent Searches</h3>
              <div className="space-y-1">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(term);
                      handleSearch(term);
                    }}
                    className="flex items-center w-full p-3 hover:bg-gray-50 rounded-xl transition-colors duration-200 group"
                  >
                    <Orders className="w-4 h-4 text-gray-400 mr-3 group-hover:text-primarycolor transition-colors" />
                    <span className="text-gray-700 group-hover:text-primarycolor transition-colors">{term}</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-primarycolor transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state while searching */}
          {isLoading && searchTerm && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primarycolor/10 rounded-full flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primarycolor border-t-transparent rounded-full" />
              </div>
              <p className="text-gray-600 font-medium">Searching for "{searchTerm}"...</p>
            </div>
          )}

          {suggestions.length > 0 && !isLoading && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Products</h3>
              <div className="space-y-2">
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <Link
                    key={index}
                    href={`/product/${suggestion.id}`}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                    onClick={() => {
                      setShowSuggestions(false);
                      handleSearch(searchTerm);
                    }}
                  >
                    <div className="relative">
                      <Image
                        src={suggestion.image_url}
                        alt={suggestion.name}
                        width={48}
                        height={48}
                        className="rounded-xl object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-gray-900 font-medium group-hover:text-primarycolor transition-colors">
                        {suggestion.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {suggestion.category_name} • Ksh {suggestion.price}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primarycolor transition-colors" />
                  </Link>
                ))}
              </div>

              {/* View All Results Button */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  href={`/search?q=${encodeURIComponent(searchTerm)}`}
                  className="flex items-center justify-center w-full p-4 bg-gradient-to-r from-primarycolor to-secondarycolor text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  onClick={() => setShowSuggestions(false)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  View all {suggestions.length > 4 ? suggestions.length : ''} results
                </Link>
              </div>
            </div>
          )}

          {searchTerm && suggestions.length === 0 && !isLoading && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">We couldn&apos;t find anything for &quot;{searchTerm}&quot;</p>
              <p className="text-sm text-gray-400 mb-4">Try searching for different keywords or browse our categories</p>
              <Link
                href={`/search?q=${encodeURIComponent(searchTerm)}`}
                className="inline-flex items-center px-6 py-3 bg-primarycolor text-white rounded-xl hover:bg-primarycolor/90 transition-colors duration-200 font-medium"
                onClick={() => setShowSuggestions(false)}
              >
                <Search className="w-4 h-4 mr-2" />
                Search all products anyway
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Marquee Animation Styles */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </>
  );
}
