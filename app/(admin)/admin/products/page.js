"use client";
import { Suspense } from 'react';
import ProductForm from '../components/productform';
import ProductTable from '../components/producttable';
import { useSupabase } from '../hooks/useSupabase';

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="h-64 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

function ProductsContent() {
  const { useProducts, useCategories } = useSupabase();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  if (productsLoading || categoriesLoading) return <LoadingSkeleton />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-primarycolor">Manage Products</h1>
      <ProductForm categories={categories} />
      <ProductTable products={products} />
    </div>
  );
}

export default function ProductManagement() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}
