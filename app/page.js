"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSupabaseContext } from './context/supabaseContext';
import ProductCarousel from './components/productcarousel';
import CategoryListing from './components/categorylisting';
import MarketingBanner from './components/marketingbanner';
import { Filter, X } from 'lucide-react';
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
      <div className="p-4 md:flex md:gap-8 max-w-[1400px] mx-auto">
        <div className="hidden md:block md:w-64 space-y-6">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-8 md:flex-1">
          <div className="h-40 md:h-[400px] bg-gray-200 rounded-lg animate-pulse" />
          <SkeletonCarousel />
          <SkeletonCarousel />
          <SkeletonCarousel />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pt-8">
      {/* Marketing Banner - Desktop Only */}
      <div className="hidden md:block w-full mb-8 px-4">
        <MarketingBanner />
      </div>

      <div className="md:flex md:gap-8">
        {/* Desktop Left Sidebar */}
        <div className="hidden md:block md:w-64 min-w-[256px]">
          <div className="sticky top-0">
            <div className="bg-gray-50 p-6 space-y-6 rounded-lg border border-gray-100 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
              <div className="space-y-6">
                <CategoryListing />
                {/* Elegant divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-primarycolor/20 to-transparent" />
                <DesktopFilter
                  categories={categories?.map(cat => cat.name) || []}
                  onApplyFilters={applyFilters}
                  initialFilters={activeFilters}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 p-4 space-y-8">
          {/* Mobile Layout */}
          <div className="md:hidden space-y-8">
            <div className="relative">
              <CategoryListing />
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="absolute top-[50%] right-0 z-10 bg-white p-2 rounded shadow-lg text-purple-800 hover:text-purple-600"
              >
                <Filter size={24} />
              </button>
            </div>
            <MarketingBanner />
          </div>

          {/* Active Filters Display */}
          {activeFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              {activeFilters.categories.map(category => (
                <span key={category} className="inline-flex items-center px-3 py-1 rounded-full bg-primarycolor text-secondarycolor">
                  {category}
                  <button onClick={() => removeFilter('category', category)} className="ml-2">
                    <X size={14} />
                  </button>
                </span>
              ))}
              {activeFilters.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full bg-primarycolor text-secondarycolor">
                  {tag}
                  <button onClick={() => removeFilter('tag', tag)} className="ml-2">
                    <X size={14} />
                  </button>
                </span>
              ))}
              <button 
                onClick={clearFilters}
                className="text-sm text-warningcolor hover:underline"
              >
                Clear All
              </button>
            </div>
          )}

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