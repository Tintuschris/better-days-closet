"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSupabaseContext } from './context/supabaseContext';
import ProductCarousel from './components/productcarousel';
import CategoryListing from './components/categorylisting';
import MarketingBanner from './components/marketingbanner';
import {
  AdjustmentsHorizontalIcon as Filter,
  XMarkIcon as X
} from '@heroicons/react/24/outline';
import FilterModal from './(modals)/filtermodal';
import DesktopFilter from './components/DesktopFilter';

const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-lg animate-pulse">
    <div className="w-full h-48 bg-gray-200" />
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

const SkeletonCarousel = ({ count = 4 }) => (
  <div className="space-y-4">
    <div className="h-6 bg-gray-200 rounded w-1/4" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array(count).fill(0).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const { products, categories } = useSupabaseContext();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const cats = searchParams.get('categories')?.split(',');
    const tags = searchParams.get('tags')?.split(',');

    if (minPrice || maxPrice || cats || tags) {
      setActiveFilters({
        priceRange: [Number(minPrice) || 0, Number(maxPrice) || 10000],
        categories: cats || [],
        tags: tags || []
      });
    }
  }, [searchParams]);

  const applyFilters = useCallback((filters) => {
    if (!products) return;

    const filtered = products.filter(product => {
      const inPriceRange = product.price >= filters.priceRange[0] && 
                          product.price <= filters.priceRange[1];
      
      const inCategory = filters.categories.length === 0 || 
                        filters.categories.includes(product.category_name);
      
      const hasTags = filters.tags.length === 0 || 
                      filters.tags.some(tag => {
                        if (tag === 'Top Deals') return product.discount;
                        if (tag === 'New Arrivals') 
                          return new Date(product.created_at) > new Date('2024-01-01');
                        return false;
                      });

      return inPriceRange && inCategory && hasTags;
    });

    setFilteredProducts(filtered);
    setActiveFilters(filters);

    const params = new URLSearchParams();
    params.set('minPrice', filters.priceRange[0]);
    params.set('maxPrice', filters.priceRange[1]);
    if (filters.categories.length) params.set('categories', filters.categories.join(','));
    if (filters.tags.length) params.set('tags', filters.tags.join(','));
    
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [products, router]);

  const removeFilter = (type, value) => {
    if (!activeFilters) return;

    const newFilters = { ...activeFilters };
    if (type === 'category') {
      newFilters.categories = newFilters.categories.filter(c => c !== value);
    } else if (type === 'tag') {
      newFilters.tags = newFilters.tags.filter(t => t !== value);
    }
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters(null);
    setFilteredProducts(products || []);
    router.push('/', { scroll: false });
  };

  if (!products) {
    return (
      <div className="p-4 max-w-[1400px] mx-auto">
        {/* Desktop Skeleton */}
        <div className="hidden md:flex md:gap-8">
          <div className="hidden md:block md:w-64 space-y-6">
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-8 md:flex-1">
            <div className="h-[300px] bg-gray-200 rounded-lg animate-pulse" />
            <SkeletonCarousel />
            <SkeletonCarousel />
          </div>
        </div>
        
        {/* Mobile Skeleton */}
        <div className="md:hidden space-y-6">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-40 bg-gray-200 rounded-lg animate-pulse" />
          <SkeletonCarousel count={2} />
        </div>
      </div>
    );
  }

  // Prepare product carousels for both mobile and desktop
  const productCarousels = (
    <>
      <ProductCarousel
        title="TOP DEALS"
        products={activeFilters ? filteredProducts.filter(p => p.discount) : products?.filter(p => p.discount) || []}
        category="top-deals"
        isSpecialCategory={true}
      />

      <ProductCarousel
        title="NEW ARRIVALS"
        products={activeFilters ? filteredProducts.filter(p => new Date(p.created_at) > new Date('2024-01-01')) : products?.filter(p => new Date(p.created_at) > new Date('2024-01-01')) || []}
        category="new-arrivals"
        isSpecialCategory={true}
      />

      {categories?.filter(category => 
        products.some(product => product.category_id === category.id)
      ).map(category => (
        <ProductCarousel
          key={category.id}
          title={category.name}
          products={activeFilters 
            ? filteredProducts.filter(p => p.category_id === category.id) 
            : products?.filter(p => p.category_id === category.id) || []
          }
          category={category.name}
          isSpecialCategory={false}
        />
      ))}
    </>
  );

  return (
    <div className="max-w-[1400px] mx-auto pt-4 px-4">
      {/* Mobile Layout */}
      <div className="md:hidden space-y-6 px-4">
        {/* Marketing Banner */}
        <MarketingBanner isMobile={true} />

        {/* Categories Section */}
        <div className="relative">
          <CategoryListing />
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="absolute top-0 right-0 z-10 bg-white p-2 rounded-full shadow-sm text-gray-600 hover:text-gray-900 hover:shadow-md transition-all duration-200"
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Active Filters Display - Mobile */}
        {activeFilters && (
          <div className="flex flex-wrap gap-2 items-center px-1">
            {activeFilters.categories.map(category => (
              <span key={category} className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                {category}
                <button onClick={() => removeFilter('category', category)} className="ml-2 text-gray-500 hover:text-gray-700">
                  <X size={14} />
                </button>
              </span>
            ))}
            {activeFilters.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                {tag}
                <button onClick={() => removeFilter('tag', tag)} className="ml-2 text-gray-500 hover:text-gray-700">
                  <X size={14} />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Mobile Product Carousels */}
        <div className="space-y-8 -mx-4">
          <div className="px-4">
            {productCarousels}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block px-4 space-y-8">
        {/* Marketing Banner */}
        <div className="w-full">
          <div className="h-[320px] overflow-hidden rounded-2xl">
            <MarketingBanner isDesktop={true} reducedHeight={true} />
          </div>
        </div>

        {/* Categories Section */}
        <CategoryListing />

        {/* Active Filters Display - Desktop */}
        {activeFilters && (
          <div className="flex flex-wrap gap-2 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-sm font-medium text-primarycolor mr-2">Active Filters:</span>
            {activeFilters.categories.map(category => (
              <span key={category} className="inline-flex items-center px-3 py-1 rounded-full bg-primarycolor text-secondarycolor text-sm">
                {category}
                <button onClick={() => removeFilter('category', category)} className="ml-2 text-secondarycolor hover:text-white">
                  <X size={14} />
                </button>
              </span>
            ))}
            {activeFilters.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full bg-primarycolor text-secondarycolor text-sm">
                {tag}
                <button onClick={() => removeFilter('tag', tag)} className="ml-2 text-secondarycolor hover:text-white">
                  <X size={14} />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-600 font-medium ml-auto"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Desktop Product Carousels */}
        <div className="space-y-8">
          {productCarousels}
        </div>
      </div>

      {isFilterModalOpen && (
        <FilterModal
          categories={categories?.map(cat => cat.name) || []}
          onApplyFilters={applyFilters}
          closeModal={() => setIsFilterModalOpen(false)}
          initialFilters={activeFilters}
        />
      )}
    </div>
  );
}
