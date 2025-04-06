"use client";
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { FiEdit2, FiTrash2, FiPlus, FiSave, FiX } from 'react-icons/fi';

export default function CategoryForm() {
  const { useCategories, useAddCategory, useUpdateCategory, useDeleteCategory } = useSupabase();
  const { data: categories, isLoading } = useCategories();
  const addMutation = useAddCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        await updateMutation.mutateAsync({
          id: selectedCategory.id,
          category: formData
        });
        toast.success('Category updated successfully');
      } else {
        await addMutation.mutateAsync(formData);
        toast.success('Category added successfully');
      }
      resetForm();
    } catch (error) {
      toast.error(selectedCategory ? 'Failed to update category' : 'Failed to add category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setFormData({ name: '', quantity: 0 });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-8 bg-primarycolor/20 rounded w-48 animate-pulse mb-6" />
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="h-10 bg-primarycolor/20 rounded animate-pulse" />
            <div className="h-10 bg-primarycolor/20 rounded animate-pulse" />
          </div>
          <div className="h-10 bg-primarycolor/20 rounded w-40 ml-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-primarycolor/10">
        <h2 className="text-xl font-semibold mb-6 text-primarycolor flex items-center">
          {selectedCategory ? (
            <>
              <FiEdit2 className="mr-2 text-primarycolor" />
              Edit Category
            </>
          ) : (
            <>
              <FiPlus className="mr-2 text-primarycolor" />
              Add New Category
            </>
          )}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primarycolor mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2.5 border border-primarycolor/30 rounded-md focus:ring-2 focus:ring-primarycolor focus:border-primarycolor text-primarycolor/90 bg-white/50"
                placeholder="Enter category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primarycolor mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="w-full p-2.5 border border-primarycolor/30 rounded-md focus:ring-2 focus:ring-primarycolor focus:border-primarycolor text-primarycolor/90 bg-white/50"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {selectedCategory && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 border border-primarycolor/30 rounded-md text-primarycolor hover:bg-primarycolor/5 font-medium transition-colors flex items-center"
              >
                <FiX className="mr-2" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              className={`px-4 py-2.5 text-white rounded-md font-medium transition-colors flex items-center ${
                selectedCategory 
                  ? 'bg-secondarycolor hover:bg-secondarycolor/90' 
                  : 'bg-primarycolor hover:bg-primarycolor/90'
              }`}
            >
              {selectedCategory ? (
                <>
                  <FiSave className="mr-2" />
                  Update Category
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Add Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-primarycolor flex items-center">
          <span className="mr-2">Categories List</span>
          <span className="bg-primarycolor/10 text-primarycolor text-xs py-1 px-2 rounded-full">
            {categories?.length || 0}
          </span>
        </h3>
        <div className="bg-white rounded-lg shadow-md border border-primarycolor/10">
          {categories?.length === 0 ? (
            <div className="p-8 text-center text-primarycolor/60">
              No categories found. Add your first category above.
            </div>
          ) : (
            categories?.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border-b border-primarycolor/10 last:border-b-0 hover:bg-primarycolor/5 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-primarycolor">{category.name}</h4>
                  <p className="text-sm text-primarycolor/70">Quantity: {category.quantity}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setFormData({ name: category.name, quantity: category.quantity });
                      document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-2 text-primarycolor hover:text-secondarycolor hover:bg-secondarycolor/10 rounded-full transition-colors"
                    title="Edit Category"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-primarycolor hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Category"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
