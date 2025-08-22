"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabaseContext } from "../../context/supabaseContext";
import ProductListing from "../../components/productlisting";
import CategoryFilterModal from '../../(modals)/categoryfiltermodal';
import {
  ChevronDown,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
} from "lucide-react";

export default function CategoryPage() {
  const { products } = useSupabaseContext();
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const { category } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (products && category) {
      let filtered = products.filter(
        (product) =>
          product.category_name.toLowerCase() === category.toLowerCase()
      );

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          filtered.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          break;
        case "popular":
          filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
          break;
      }

      setCategoryProducts(filtered);
      setIsLoading(false);
    }
  }, [products, category, sortBy]);

  const handleFilter = (filters) => {
    let filtered = products.filter(
      product => product.category_name.toLowerCase() === category.toLowerCase()
    );

    // Only apply filters if they exist and have values
    if (filters.priceRange && Array.isArray(filters.priceRange)) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1]
      );
    }

    if (filters.ratings?.length > 0) {
      filtered = filtered.filter(product => 
        filters.ratings.includes(Math.floor(product.rating || 0))
      );
    }

    if (filters.availability === 'inStock') {
      filtered = filtered.filter(product => product.in_stock);
    }

    // Apply current sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "popular":
        filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
    }

    setCategoryProducts(filtered);
    setActiveFilters(Object.keys(filters).length > 0 ? filters : null);
    setIsFilterModalOpen(false);
  };

  const clearAllFilters = () => {
    setActiveFilters(null);
    handleFilter({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-xl w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="space-y-4">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Category Header - Fixed sticky issue */}
      <div className="sticky top-16 md:top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="px-6 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <button 
              onClick={() => router.push("/")} 
              className="hover:text-primarycolor transition-colors duration-200 font-medium"
            >
              Home
            </button>
            <ChevronDown className="w-4 h-4 mx-2 rotate-[-90deg] text-gray-400" />
            <span className="text-primarycolor font-semibold capitalize">{category}</span>
          </div>
          
          {/* Category Title & Count */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primarycolor capitalize tracking-tight">
                {category}
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-primarycolor to-secondarycolor rounded-full mt-2"></div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Found</div>
              <div className="text-lg font-bold text-primarycolor">
                {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Controls */}
        <div className="px-6 py-4 bg-gray-50/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter Controls */}
            <div className="flex gap-3">
              {/* Enhanced Filter Button */}
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl text-primarycolor font-semibold hover:border-primarycolor hover:bg-primarycolor/5 transition-all duration-200 shadow-sm"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {activeFilters && (
                  <div className="w-2 h-2 bg-secondarycolor rounded-full"></div>
                )}
              </button>
              
              {/* Enhanced View Toggle */}
              <button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl text-primarycolor font-semibold hover:border-primarycolor hover:bg-primarycolor/5 transition-all duration-200 shadow-sm"
              >
                {viewMode === "grid" ? (
                  <>
                    <List className="w-5 h-5" />
                    <span className="hidden sm:inline">List</span>
                  </>
                ) : (
                  <>
                    <Grid className="w-5 h-5" />
                    <span className="hidden sm:inline">Grid</span>
                  </>
                )}
              </button>
            </div>

            {/* Enhanced Sort Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <SlidersHorizontal className="w-5 h-5" />
                <span className="text-sm font-medium">Sort by:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl text-primarycolor font-semibold focus:outline-none focus:border-primarycolor focus:ring-4 focus:ring-primarycolor/10 transition-all duration-200 shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {activeFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 bg-primarycolor/10 text-primarycolor rounded-full text-sm font-medium hover:bg-primarycolor/20 transition-colors duration-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Product Listing */}
      <div className="px-6 py-8">
        {categoryProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-primarycolor mb-3">No products found</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Try adjusting your filters or search criteria to find what you're looking for.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-8 py-3 bg-gradient-to-r from-primarycolor to-purple-700 text-white rounded-2xl font-semibold hover:from-primarycolor/90 hover:to-purple-700/90 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <ProductListing products={categoryProducts} viewMode={viewMode} />
        )}
      </div>

      {/* Enhanced Filter Modal */}
      {isFilterModalOpen && (
        <CategoryFilterModal
          onApplyFilters={handleFilter}
          closeModal={() => setIsFilterModalOpen(false)}
          initialFilters={activeFilters}
        />
      )}
    </div>
  );
}
