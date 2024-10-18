"use client";
import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from './hooks/useSupabase';
import ProductCarousel from './components/productcarousel';
import CategoryListing from './components/categorylisting';
import { Filter } from 'lucide-react';
import FilterModal from './(modals)/filtermodal';

export default function HomePage() {
  const { fetchProducts, fetchCategories } = useSupabase();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);

  // Load data on component mount
  useEffect(() => {
    async function loadData() {
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setAllProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
      setCategories(fetchedCategories);
    }
    loadData();
  }, [fetchProducts, fetchCategories]);

  // Toggle the filter modal
  const toggleFilterModal = () => {
    setIsFilterModalOpen((prevState) => !prevState);
  };

  // Apply filters and update filtered products
  const handleApplyFilters = useCallback((filters) => {
    setAppliedFilters(filters);
    const { priceRange, categories, tags } = filters;

    const filtered = allProducts.filter(product => {
      const inPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
      const inCategory = categories.length === 0 || categories.includes(product.category_name);
      const hasTags = tags.length === 0 || tags.some(tag => {
        if (tag === 'Top Deals') return product.discount;
        if (tag === 'New Arrivals') return new Date(product.created_at) > new Date('2024-01-01');
        return false;
      });

      return inPriceRange && inCategory && hasTags;
    });

    setFilteredProducts(filtered);
  }, [allProducts]);

  const topDeals = filteredProducts.filter(p => p.discount);
  const newArrivals = filteredProducts.filter(p => new Date(p.created_at) > new Date('2024-01-01'));

  return (
    <div className="space-y-8 p-4">
      <div className="relative">
        <div className="overflow-x-auto whitespace-nowrap">
          <CategoryListing categories={categories} />
        </div>
        <div className="absolute top-[50%] right-0 z-10 bg-white p-2 rounded shadow-lg">
          <button
            onClick={toggleFilterModal}
            className="text-purple-800 hover:text-purple-600"
          >
            <Filter size={24} />
          </button>
        </div>
      </div>

      <div className="w-full h-48 bg-secondaryvariant">Marketing Banner Carousel</div>

      <ProductCarousel
        title="TOP DEALS"
        products={topDeals}
        category="top-deals"
        isSpecialCategory={true}
      />

      <ProductCarousel
        title="NEW ARRIVALS"
        products={newArrivals}
        category="new-arrivals"
        isSpecialCategory={true}
      />

      {categories.map(category => (
        <ProductCarousel
          key={category.id}
          title={category.name}
          products={filteredProducts.filter(p => p.category_id === category.id)}
          category={category.name}
          isSpecialCategory={false}
        />
      ))}

      {isFilterModalOpen && (
        <FilterModal
          categories={categories.map(cat => cat.name)}
          onApplyFilters={handleApplyFilters}
          closeModal={toggleFilterModal}
          initialFilters={appliedFilters}
        />
      )}
    </div>
  );
}
