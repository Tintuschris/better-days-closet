"use client";
import { Suspense } from 'react';
import CategoryForm from '../components/categoryform';
import { useSupabase } from '../hooks/useSupabase';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 bg-primarycolor/20 rounded w-48 animate-pulse" />
      <div className="h-48 bg-primarycolor/10 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-16 bg-primarycolor/15 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
function CategoriesContent() {
  const { useCategories } = useSupabase();
  const { data: categories, isLoading } = useCategories();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="p-6 bg-secondarycolor/5 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-primarycolor">Manage Categories</h1>
      
      <div className="bg-white rounded-lg shadow-md border border-primarycolor/10 mb-8">
        <div className="p-4 border-b border-primarycolor/10">
          <h2 className="text-lg font-semibold text-primarycolor">Add New Category</h2>
        </div>
        <CategoryForm />
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-primarycolor/10">
        <div className="p-4 border-b border-primarycolor/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-primarycolor">Current Categories</h2>
          <span className="bg-primarycolor/10 text-primarycolor text-sm py-1 px-3 rounded-full">
            {categories?.length || 0} Categories
          </span>
        </div>
        
        <div className="p-6">
          {categories?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondarycolor">No categories found. Add your first category above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories?.map((category) => (
                <div key={category.id} className="p-4 bg-white rounded-lg border border-primarycolor/10 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                  <div>
                    <p className="text-primarycolor font-medium">{category.name}</p>
                    <p className="text-secondarycolor text-sm">{category.product_count || 0} products</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1.5 text-secondarycolor hover:text-primarycolor hover:bg-primarycolor/10 rounded-full transition-colors">
                      <FiEdit2 size={16} />
                    </button>
                    <button className="p-1.5 text-secondarycolor hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add Category Button */}
              <div 
                className="p-4 bg-primarycolor/5 rounded-lg border border-dashed border-primarycolor/30 flex items-center justify-center cursor-pointer hover:border-primarycolor hover:bg-primarycolor/10 transition-colors"
                onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <div className="flex flex-col items-center text-secondarycolor hover:text-primarycolor">
                  <FiPlus size={24} className="mb-2" />
                  <span className="text-sm font-medium">Add Category</span>
                </div>
              </div>
            </div>
          )}
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
