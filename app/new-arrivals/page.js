"use client";
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import ProductCard from '../components/productcard';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="space-y-4">
              <div className="h-48 bg-gray-200 rounded-2xl"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Category Header */}
      <div className="sticky top-16 md:top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="px-6 py-4">
          {/* Category Title & Count */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primarycolor tracking-tight">
                New Arrivals
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-primarycolor to-secondarycolor rounded-full mt-2"></div>
            </div>
            <div className="text-right">
              <div className="text-sm text-primarycolor/60">Found</div>
              <div className="text-lg font-bold text-primarycolor">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-6 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-lg font-semibold text-primarycolor mb-2">No new arrivals yet</h3>
            <p className="text-primarycolor/60">Check back soon for the latest products!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
