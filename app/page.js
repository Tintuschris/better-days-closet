"use client";
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSupabaseContext } from './context/supabaseContext';
import ProductCarousel from './components/productcarousel';
import CategoryListing from './components/categorylisting';
import { Filter, X } from 'lucide-react';
import FilterModal from './(modals)/filtermodal';

export default function HomePage() {
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

  return (
    <div className="space-y-8 p-4">
      <div className="relative">
        <CategoryListing categories={categories} />
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="absolute top-[50%] right-0 z-10 bg-white p-2 rounded shadow-lg text-purple-800 hover:text-purple-600"
        >
          <Filter size={24} />
        </button>
      </div>

      {activeFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          {activeFilters.categories.map(category => (
            <span key={category} className="inline-flex items-center px-3 py-1 rounded-full bg-primarycolor text-secondarycolorbg-gray-100">
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

      {categories?.map(category => (
        <ProductCarousel
          key={category.id}
          title={category.name}
          products={activeFilters ? filteredProducts.filter(p => p.category_id === category.id) : products?.filter(p => p.category_id === category.id) || []}
          category={category.name}
          isSpecialCategory={false}
        />
      ))}

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
