"use client";
import { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { FiToggleLeft, FiToggleRight, FiPlus, FiX, FiSave } from 'react-icons/fi';

export default function CategoryAttributesForm() {
  const { useCategories, useCategoryAttributes, useUpdateCategoryAttributes } = useSupabase();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: categoryAttributes, isLoading: attributesLoading } = useCategoryAttributes();
  const updateMutation = useUpdateCategoryAttributes();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    has_sizes: false,
    has_colors: false,
    available_sizes: [],
    available_colors: []
  });
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  // Default size and color options
  const defaultSizes = {
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    shoes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
  };

  const defaultColors = [
    'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 
    'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Navy'
  ];

  useEffect(() => {
    if (selectedCategory && categoryAttributes) {
      const attributes = categoryAttributes.find(attr => attr.category_id === selectedCategory.id);
      if (attributes) {
        setFormData({
          has_sizes: attributes.has_sizes,
          has_colors: attributes.has_colors,
          available_sizes: attributes.available_sizes || [],
          available_colors: attributes.available_colors || []
        });
      } else {
        // Set defaults based on category type
        const categoryName = selectedCategory.name.toLowerCase();
        const isClothing = ['women', 'men', 'kids'].includes(categoryName);
        const isShoes = categoryName === 'shoes';
        
        setFormData({
          has_sizes: isClothing || isShoes,
          has_colors: isClothing || isShoes,
          available_sizes: isClothing ? defaultSizes.clothing : isShoes ? defaultSizes.shoes : [],
          available_colors: (isClothing || isShoes) ? defaultColors : []
        });
      }
    }
  }, [selectedCategory, categoryAttributes, defaultColors, defaultSizes.clothing, defaultSizes.shoes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        categoryId: selectedCategory.id,
        attributes: formData
      });
      toast.success('Category attributes updated successfully');
    } catch (error) {
      toast.error('Failed to update category attributes');
      console.error(error);
    }
  };

  const addSize = () => {
    if (newSize.trim() && !formData.available_sizes.includes(newSize.trim())) {
      setFormData(prev => ({
        ...prev,
        available_sizes: [...prev.available_sizes, newSize.trim()]
      }));
      setNewSize('');
    }
  };

  const removeSize = (size) => {
    setFormData(prev => ({
      ...prev,
      available_sizes: prev.available_sizes.filter(s => s !== size)
    }));
  };

  const addColor = () => {
    if (newColor.trim() && !formData.available_colors.includes(newColor.trim())) {
      setFormData(prev => ({
        ...prev,
        available_colors: [...prev.available_colors, newColor.trim()]
      }));
      setNewColor('');
    }
  };

  const removeColor = (color) => {
    setFormData(prev => ({
      ...prev,
      available_colors: prev.available_colors.filter(c => c !== color)
    }));
  };

  const addDefaultSizes = (type) => {
    const sizes = type === 'clothing' ? defaultSizes.clothing : defaultSizes.shoes;
    setFormData(prev => ({
      ...prev,
      available_sizes: [...new Set([...prev.available_sizes, ...sizes])]
    }));
  };

  const addDefaultColors = () => {
    setFormData(prev => ({
      ...prev,
      available_colors: [...new Set([...prev.available_colors, ...defaultColors])]
    }));
  };

  if (categoriesLoading || attributesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-primarycolor">Category Attributes</h2>
      
      {/* Category Selection */}
      <div className="bg-white rounded-lg shadow-md border border-primarycolor/10 p-6">
        <h3 className="text-lg font-semibold text-primarycolor mb-4">Select Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedCategory?.id === category.id
                  ? 'border-primarycolor bg-primarycolor/10 text-primarycolor'
                  : 'border-gray-200 hover:border-primarycolor/50 text-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Attributes Configuration */}
      {selectedCategory && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-primarycolor/10 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-primarycolor">
            Configure {selectedCategory.name} Attributes
          </h3>

          {/* Toggle Switches */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-primarycolor">Support Sizes</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, has_sizes: !prev.has_sizes }))}
                  className="flex items-center"
                >
                  {formData.has_sizes ? (
                    <FiToggleRight className="text-2xl text-primarycolor" />
                  ) : (
                    <FiToggleLeft className="text-2xl text-gray-400" />
                  )}
                </button>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-primarycolor">Support Colors</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, has_colors: !prev.has_colors }))}
                  className="flex items-center"
                >
                  {formData.has_colors ? (
                    <FiToggleRight className="text-2xl text-primarycolor" />
                  ) : (
                    <FiToggleLeft className="text-2xl text-gray-400" />
                  )}
                </button>
              </label>
            </div>
          </div>

          {/* Sizes Configuration */}
          {formData.has_sizes && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-primarycolor">Available Sizes</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addDefaultSizes('clothing')}
                    className="text-xs px-2 py-1 bg-primarycolor/10 text-primarycolor rounded hover:bg-primarycolor/20"
                  >
                    Add Clothing Sizes
                  </button>
                  <button
                    type="button"
                    onClick={() => addDefaultSizes('shoes')}
                    className="text-xs px-2 py-1 bg-primarycolor/10 text-primarycolor rounded hover:bg-primarycolor/20"
                  >
                    Add Shoe Sizes
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Add new size"
                  className="flex-1 p-2 border border-primarycolor/20 rounded focus:ring-2 focus:ring-primarycolor/50"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-3 py-2 bg-primarycolor text-white rounded hover:bg-primarycolor/90"
                >
                  <FiPlus />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.available_sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center px-3 py-1 bg-primarycolor/10 text-primarycolor rounded-full text-sm"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="ml-2 text-primarycolor/70 hover:text-primarycolor"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Colors Configuration */}
          {formData.has_colors && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-primarycolor">Available Colors</h4>
                <button
                  type="button"
                  onClick={addDefaultColors}
                  className="text-xs px-2 py-1 bg-primarycolor/10 text-primarycolor rounded hover:bg-primarycolor/20"
                >
                  Add Default Colors
                </button>
              </div>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Add new color"
                  className="flex-1 p-2 border border-primarycolor/20 rounded focus:ring-2 focus:ring-primarycolor/50"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-3 py-2 bg-primarycolor text-white rounded hover:bg-primarycolor/90"
                >
                  <FiPlus />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.available_colors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center px-3 py-1 bg-primarycolor/10 text-primarycolor rounded-full text-sm"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="ml-2 text-primarycolor/70 hover:text-primarycolor"
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-primarycolor text-white rounded-lg hover:bg-primarycolor/90 disabled:opacity-50"
            >
              <FiSave />
              {updateMutation.isLoading ? 'Saving...' : 'Save Attributes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
