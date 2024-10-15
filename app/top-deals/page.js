"use client"
import { useEffect, useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import ProductCard from '../components/ProductCard';

export default function TopDealsPage() {
  const [products, setProducts] = useState([]);
  const { fetchProducts } = useSupabase();

  useEffect(() => {
    async function loadProducts() {
      const allProducts = await fetchProducts();
      const topDeals = allProducts.filter(p => p.discount);
      setProducts(topDeals);
    }
    loadProducts();
  }, []);

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