"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSupabaseContext } from "../context/supabaseContext";
import ProductCard from "../components/productcard";
import {
  MagnifyingGlassIcon as Search,
  AdjustmentsHorizontalIcon as Filter,
  XMarkIcon as X,
  ChevronDownIcon as ChevronDown,
  FunnelIcon as Funnel,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, categories } = useSupabaseContext();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (products) {
      filterProducts();
    }
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const filterProducts = () => {
    setIsLoading(true);
    let filtered = products || [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category_name === selectedCategory
      );
    }

    // Price filter
    if (priceRange.min) {
      filtered = filtered.filter((product) => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter((product) => product.price <= parseFloat(priceRange.max));
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        // Relevance - keep original order
        break;
    }

    setFilteredProducts(filtered);
    setIsLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    if (sortBy !== "relevance") params.set("sort", sortBy);
    
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSortBy("relevance");
  };

  const activeFiltersCount = [selectedCategory, priceRange.min, priceRange.max].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced Search Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="What are you looking for today?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-4 pl-6 pr-14 text-base sm:text-lg bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 transition-all duration-200 shadow-sm text-gray-900 placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-primarycolor to-secondarycolor text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Enhanced Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-primarycolor transition-all duration-200 shadow-sm"
              >
                <Filter className="w-4 h-4 text-primarycolor" />
                <span className="text-gray-700 font-medium">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-gradient-to-r from-primarycolor to-secondarycolor text-white text-xs rounded-full px-2 py-1 font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Enhanced Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 transition-all duration-200 shadow-sm text-gray-700 font-medium"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="newest">Newest First</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Enhanced Results Count */}
            <div className="text-gray-600 font-medium">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primarycolor border-t-transparent rounded-full"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                <span className="text-sm sm:text-base">
                  <span className="font-semibold text-primarycolor">{filteredProducts.length}</span> result{filteredProducts.length !== 1 ? "s" : ""}
                  {searchTerm && (
                    <>
                      {" "}for <span className="font-semibold text-gray-900">"{searchTerm}"</span>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Enhanced Filters Sidebar */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-72 flex-shrink-0`}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-32">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primarycolor">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-primarycolor transition-colors duration-200 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Category</h4>
                <div className="space-y-3">
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ""}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-primarycolor focus:ring-primarycolor focus:ring-2 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-primarycolor transition-colors duration-200 font-medium">All Categories</span>
                  </label>
                  {categories?.map((category) => (
                    <label key={category.id} className="flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category.name}
                        checked={selectedCategory === category.name}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-primarycolor focus:ring-primarycolor focus:ring-2 border-gray-300"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-primarycolor transition-colors duration-200 font-medium">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Price Range</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Min Price (Ksh)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 transition-all duration-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Max Price (Ksh)</label>
                    <input
                      type="number"
                      placeholder="10000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 transition-all duration-200 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Products Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 animate-pulse">
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded-lg"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                      <div className="h-5 bg-gray-300 rounded-lg w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="transform transition-all duration-200 hover:scale-[1.02]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 sm:py-24">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
                  {searchTerm
                    ? `We couldn't find any products matching "${searchTerm}". Try adjusting your search or filters.`
                    : "Try adjusting your filters to see more results, or browse our categories."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      clearFilters();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-primarycolor to-secondarycolor text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
                  >
                    Clear search
                  </button>
                  <Link
                    href="/"
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Browse all products
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
