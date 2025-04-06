"use client";
import { Suspense } from 'react';
import ProductForm from '../components/productform';
import ProductTable from '../components/producttable';
import { useSupabase } from '../hooks/useSupabase';

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="h-64 bg-gray-200 rounded animate-pulse" />
      <div className="h-96 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

function ProductsContent() {
  const { useProducts, useCategories } = useSupabase();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  if (productsLoading || categoriesLoading) return <LoadingSkeleton />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Products</h1>
      <div className="bg-white rounded-lg shadow-md border border-gray-100 mb-8">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Add New Product</h2>
        </div>
        <ProductForm categories={categories} />
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Product Inventory</h2>
        </div>
        <ProductTable products={products} />
      </div>
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
