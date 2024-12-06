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

    if (filters.priceRange) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1]
      );
    }

    if (filters.ratings?.length) {
      filtered = filtered.filter(product => 
        filters.ratings.includes(Math.floor(product.rating || 0))
      );
    }

    if (filters.availability === 'inStock') {
      filtered = filtered.filter(product => product.in_stock);
    }

    setCategoryProducts(filtered);
    setActiveFilters(filters);
    setIsFilterModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="p-4 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Category Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center text-sm text-primarycolor mb-2">
            <span onClick={() => router.push("/")} className="cursor-pointer">
              Home
            </span>
            <ChevronDown className="w-4 h-4 mx-1 rotate-[-90deg]" />
            <span className="font-medium capitalize">{category}</span>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-primarycolor capitalize">
              {category}
            </h1>
            <span className="text-sm text-primarycolor">
              {categoryProducts.length} products
            </span>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1 border rounded-full text-primarycolor"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="flex items-center gap-1 px-3 py-1 border rounded-full text-primarycolor"
            >
              {viewMode === "grid" ? (
                <Grid className="w-4 h-4" />
              ) : (
                <List className="w-4 h-4" />
              )}
              View
            </button>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primarycolor" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-none text-primarycolor text-sm focus:outline-none bg-transparent"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Listing */}
      <div className="p-4">
        {categoryProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-primarycolor mb-4">No products found</p>
            <button
              onClick={() => {
                setActiveFilters(null);
                handleFilter({});
              }}
              className="px-6 py-2 bg-primarycolor text-white rounded-full"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <ProductListing products={categoryProducts} viewMode={viewMode} />
        )}
      </div>

      {/* Filter Modal */}
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
