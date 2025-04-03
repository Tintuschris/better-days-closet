"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import {
  AlignLeft,
  ShoppingCart,
  User,
  Heart,
  Search,
  X,
  Clock,
  ArrowRight,
  Facebook,
  Instagram,
  Phone,
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
  const searchRef = useRef(null);

  const isCartActive = pathname === "/cart";
  const isProfileActive =
    pathname === "/profile" || pathname.startsWith("/profile/");
  const isWishlistActive = pathname === "/wishlist";

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    // Handle clicks outside of search area to close suggestions
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsLoading(true);

    if (value.trim()) {
      const filtered =
        products?.filter(
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
      {/* Top Bar with Social Icons and Marketing Marquee - Desktop Only */}
      <div className="hidden md:block bg-primarycolor text-white py-2 px-4">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          {/* Social Icons - 25% width */}
          <div className="flex items-center space-x-6 z-10 bg-primarycolor pr-4 w-1/4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondarycolor transition-colors"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondarycolor transition-colors"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://wa.me/yourphonenumber"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondarycolor transition-colors"
            >
              <Phone size={18} />
            </a>
          </div>

          {/* Marketing Marquee */}
          <div className="overflow-hidden flex-1 relative">
            <div className="whitespace-nowrap animate-marquee">
              🌟 Free shipping on orders over Ksh. 5,000! Shop now and enjoy
              exclusive deals on our latest arrivals! 🌟
            </div>
          </div>
        </div>
      </div>

      <header className="relative z-40 p-4 bg-white shadow-md">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-center transition-transform duration-200 ease-in-out hover:scale-110"
          >
            {menuOpen ? (
              <X className="h-6 w-6 text-warningcolor transition-all duration-200 ease-in-out" />
            ) : (
              <AlignLeft className="h-6 w-6 text-primarycolor transition-all duration-200 ease-in-out" />
            )}
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
              <ShoppingCart
                className={`h-6 w-6 transition-colors duration-200 ${
                  isCartActive ? "text-secondarycolor" : "text-primarycolor"
                }`}
              />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-warningcolor text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href={user ? "/profile" : "/auth/login"} prefetch>
              <User
                className={`h-6 w-6 transition-colors duration-200 ${
                  isProfileActive ? "text-secondarycolor" : "text-primarycolor"
                }`}
              />
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
            {/* Search Bar with Dropdown - Amazon Style with fixed border */}
            <div className="relative flex items-center w-1/2" ref={searchRef}>
              <div className="relative flex items-center w-full overflow-hidden rounded-full border-2 border-primarycolor">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full py-2 pl-4 pr-12 text-sm border-0 focus:outline-none"
                />
                <button
                  onClick={() => handleSearch()}
                  className="absolute right-0 h-full px-4 bg-primarycolor text-white hover:bg-primarycolor/90 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                {isLoading && (
                  <div className="absolute right-16 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-primarycolor border-t-transparent rounded-full" />
                  </div>
                )}
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-primarycolor rounded-lg shadow-lg z-50">
                  <div className="flex justify-between items-center p-2 border-b">
                    <h3 className="text-sm font-medium text-primarycolor">
                      {searchTerm ? "Search Results" : "Recent Searches"}
                    </h3>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="text-gray-500 hover:text-primarycolor"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {searchTerm === "" && recentSearches.length > 0 && (
                    <div className="p-2">
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

                  {searchTerm && suggestions.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      No results found for &quot;{searchTerm}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Icons with Text Labels in Row */}
            <Link
              href="/cart"
              prefetch
              className="relative flex items-center group"
            >
              <div className="relative">
                <ShoppingCart
                  className={`h-6 w-6 transition-colors duration-200 ${
                    isCartActive ? "text-secondarycolor" : "text-primarycolor"
                  } group-hover:text-secondarycolor`}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-warningcolor text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="ml-2 text-sm text-primarycolor group-hover:text-secondarycolor transition-colors">
                Cart
              </span>
            </Link>

            <Link
              href="/wishlist"
              prefetch
              className="relative flex items-center group"
            >
              <div className="relative">
                <Heart
                  className={`h-6 w-6 transition-colors duration-200 ${
                    isWishlistActive
                      ? "text-secondarycolor"
                      : "text-primarycolor"
                  } group-hover:text-secondarycolor`}
                />
                {wishlistItems?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-warningcolor text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <span className="ml-2 text-sm text-primarycolor group-hover:text-secondarycolor transition-colors">
                Wishlist
              </span>
            </Link>

            <Link
              href={user ? "/profile" : "/auth/login"}
              prefetch
              className="flex items-center group"
            >
              <User
                className={`h-6 w-6 transition-colors duration-200 ${
                  isProfileActive ? "text-secondarycolor" : "text-primarycolor"
                } group-hover:text-secondarycolor`}
              />
              <span className="ml-2 text-sm text-primarycolor group-hover:text-secondarycolor transition-colors">
                {user ? "Profile" : "Login"}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-30 md:hidden
          ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMenuOpen(false)}
      />

      <nav
        className={`fixed z-40 left-0 text-primarycolor bg-secondarycolor w-full shadow-md md:hidden
          transition-all duration-300 ease-in-out
          ${menuOpen ? "top-16" : "-top-[100%]"}
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

      {/* Add CSS for the marquee animation */}
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
