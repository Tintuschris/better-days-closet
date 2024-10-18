"use client"
import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import ProductCard from '../components/productcard';

export default function TopDealsPage() {
  const [products, setProducts] = useState([]);
  const { fetchProducts } = useSupabase();

  const loadProducts = useCallback(async () => {
    const allProducts = await fetchProducts();
    const topDeals = allProducts.filter(p => p.discount);
    setProducts(topDeals);
  }, [fetchProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Top Deals</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
