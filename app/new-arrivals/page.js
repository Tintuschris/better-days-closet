"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import ProductCard from '../components/productcard';

function LoadingSkeleton() {
  return (
    <div className="p-4">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 8].map((item) => (
          <div key={item} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function NewArrivalsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <NewArrivalsContent />
    </Suspense>
  );
}

function NewArrivalsContent() {
  const [products, setProducts] = useState([]);
  const { fetchProducts } = useSupabase();

  const loadProducts = useCallback(async () => {
    const allProducts = await fetchProducts();
    const newArrivals = allProducts.filter(p => new Date(p.created_at) > new Date('2024-01-01'));
    setProducts(newArrivals);
  }, [fetchProducts]);

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
