"use client";
import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import ProductCard from '../components/ProductCard';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const { fetchProducts } = useSupabase();

  // Fetch new arrivals using useCallback
  const loadProducts = useCallback(async () => {
    const allProducts = await fetchProducts();
    const newArrivals = allProducts.filter(p => new Date(p.created_at) > new Date('2024-01-01'));
    setProducts(newArrivals);
  }, [fetchProducts]);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">New Arrivals</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
