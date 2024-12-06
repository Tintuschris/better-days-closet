"use client";
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

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
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">
          {selectedCategory ? 'Edit Category' : 'Add New Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primarycolor focus:border-primarycolor"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primarycolor focus:border-primarycolor"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {selectedCategory && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-primarycolor text-white rounded-md hover:bg-primarycolor/90 flex items-center"
            >
              <FiPlus className="mr-2" />
              {selectedCategory ? 'Update Category' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Categories List</h3>
        <div className="bg-white rounded-lg shadow-md">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 border-b last:border-b-0"
            >
              <div>
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-gray-600">Quantity: {category.quantity}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setFormData({ name: category.name, quantity: category.quantity });
                  }}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
