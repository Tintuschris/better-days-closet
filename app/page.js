"use client"
import { useEffect, useState } from 'react';
import { useSupabase } from './hooks/useSupabase';
import ProductCarousel from './components/ProductCarousel';
import CategoryListing from './components/CategoryListing';

export default function HomePage() {
  const { fetchProducts, fetchCategories } = useSupabase();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadData() {
      const products = await fetchProducts();
      const categories = await fetchCategories();
      setProducts(products);
      setCategories(categories);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 p-4">
      {/* Categories */}
      <CategoryListing categories={categories} />

      {/* Marketing Banner (can be static or fetched from DB) */}
      <div className="w-full h-48 bg-secondaryvariant">Marketing Banner Carousel</div>

      {/* Top Deals */}
      <ProductCarousel title="TOP DEALS" products={products.filter(p => p.discount)} />

      {/* New Arrivals */}
      <ProductCarousel title="NEW ARRIVALS" products={products.filter(p => p.created_at > '2024-01-01')} />


    </div>
  );
}
