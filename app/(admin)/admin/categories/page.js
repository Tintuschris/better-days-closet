"use client";
import { Suspense } from 'react';
import CategoryForm from '../components/categoryform';
import { useSupabase } from '../hooks/useSupabase';

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="h-48 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

function CategoriesContent() {
  const { useCategories } = useSupabase();
  const { data: categories, isLoading } = useCategories();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-primarycolor">Manage Categories</h1>
      <CategoryForm />
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-primarycolor">Current Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category) => (
            <div key={category.id} className="p-4 bg-white rounded-lg shadow">
              <p className="text-primarycolor">{category.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoryManagement() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CategoriesContent />
    </Suspense>
  );
}
