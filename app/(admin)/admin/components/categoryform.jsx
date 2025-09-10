"use client";
import { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { FiList, FiSave, FiX, FiRotateCcw, FiPlus, FiTrash2, FiTag, FiImage } from 'react-icons/fi';
import ImageUploadOptimizer from './ImageUploadOptimizer';
import { PremiumCard, Button, Input, FormGroup, Label, GradientText } from '../../../components/ui';

export default function CategoryForm({ category, onClose, onSuccess }) {
  const { useAddCategory, useUpdateCategory, useUploadCategoryImage } = useSupabase();
  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();
  const uploadMutation = useUploadCategoryImage();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    icon_url: ''
  });

  const [attributeData, setAttributeData] = useState({
    has_sizes: false,
    has_colors: false,
    available_sizes: [],
    available_colors: []
  });

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  // Initialize form with category data if editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image_url: category.image_url || '',
        icon_url: category.icon_url || ''
      });

      // Load category attributes if they exist
      if (category.category_attributes) {
        setAttributeData({
          has_sizes: category.category_attributes.has_sizes || false,
          has_colors: category.category_attributes.has_colors || false,
          available_sizes: category.category_attributes.available_sizes || [],
          available_colors: category.category_attributes.available_colors || []
        });
      }
    } else {
      setFormData({
        name: '',
        description: ''
      });
      setAttributeData({
        has_sizes: false,
        has_colors: false,
        available_sizes: [],
        available_colors: []
      });
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const categoryData = {
        ...formData,
        attributes: attributeData
      };

      if (category) {
        await updateCategory.mutateAsync({
          id: category.id,
          category: categoryData
        });
        toast.success('Category updated successfully');
      } else {
        await addCategory.mutateAsync(categoryData);
        toast.success('Category created successfully');
      }

      // Reset form and call success callback
      resetForm();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(`Failed to save category: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      icon_url: ''
    });
    setAttributeData({
      has_sizes: false,
      has_colors: false,
      available_sizes: [],
      available_colors: []
    });
    setNewSize('');
    setNewColor('');
  };

  // Handle adding new size
  const handleAddSize = () => {
    if (newSize.trim() && !attributeData.available_sizes.includes(newSize.trim())) {
      setAttributeData(prev => ({
        ...prev,
        available_sizes: [...prev.available_sizes, newSize.trim()]
      }));
      setNewSize('');
    }
  };

  // Handle removing size
  const handleRemoveSize = (sizeToRemove) => {
    setAttributeData(prev => ({
      ...prev,
      available_sizes: prev.available_sizes.filter(size => size !== sizeToRemove)
    }));
  };

  // Handle adding new color
  const handleAddColor = () => {
    if (newColor.trim() && !attributeData.available_colors.includes(newColor.trim())) {
      setAttributeData(prev => ({
        ...prev,
        available_colors: [...prev.available_colors, newColor.trim()]
      }));
      setNewColor('');
    }
  };

  // Handle removing color
  const handleRemoveColor = (colorToRemove) => {
    setAttributeData(prev => ({
      ...prev,
      available_colors: prev.available_colors.filter(color => color !== colorToRemove)
    }));
  };

  return (
    <PremiumCard className="overflow-hidden">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <GradientText className="text-lg font-semibold text-white flex items-center gap-2">
              <FiList className="w-5 h-5" />
              {category ? 'Edit Category' : 'Add New Category'}
            </GradientText>
            <p className="text-white/80 text-sm mt-1">
              {category ? 'Update category information' : 'Create a new product category'}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              type="button"
            >
              <FiX className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-primarycolor mb-4 flex items-center gap-2">
              <FiList className="w-4 h-4" />
              Category Information
            </h4>

            <div className="space-y-4">
              <FormGroup>
                <Label required>Category Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description (optional)"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-primarycolor/30 rounded-xl focus:border-primarycolor focus:outline-none transition-colors resize-none text-primarycolor"
                />
              </FormGroup>
            </div>
          </div>

          {/* Category Images Section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-6">
            <h4 className="text-sm font-medium text-primarycolor mb-4 flex items-center gap-2">
              <FiImage className="w-4 h-4" />
              Category Images
            </h4>

            {/* Main Category Image */}
            <div>
              <Label>Category Image</Label>
              <ImageUploadOptimizer
                onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, image_url: urls[0] }))}
                maxImages={1}
                existingImages={formData.image_url ? [{
                  id: 'main',
                  url: formData.image_url,
                  originalName: 'Category Image'
                }] : []}
                uploadFunction={uploadMutation.mutateAsync}
                acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                maxFileSize={2 * 1024 * 1024} // 2MB
                optimizationSettings={{
                  maxWidth: 800,
                  maxHeight: 800,
                  quality: 0.8,
                  format: 'webp'
                }}
              />
            </div>

            {/* Category Icon */}
            <div>
              <Label>Category Icon</Label>
              <ImageUploadOptimizer
                onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, icon_url: urls[0] }))}
                maxImages={1}
                existingImages={formData.icon_url ? [{
                  id: 'icon',
                  url: formData.icon_url,
                  originalName: 'Category Icon'
                }] : []}
                uploadFunction={uploadMutation.mutateAsync}
                acceptedFormats={['image/png', 'image/svg+xml']}
                maxFileSize={512 * 1024} // 512KB
                optimizationSettings={{
                  maxWidth: 128,
                  maxHeight: 128,
                  quality: 1,
                  format: 'png'
                }}
              />
            </div>
          </div>

          {/* Category Attributes Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-primarycolor mb-4 flex items-center gap-2">
              <FiTag className="w-4 h-4" />
              Product Attributes
            </h4>

            <div className="space-y-4">
              {/* Size Attributes */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={attributeData.has_sizes}
                    onChange={(e) => setAttributeData(prev => ({ ...prev, has_sizes: e.target.checked }))}
                    className="w-4 h-4 text-primarycolor border-primarycolor/30 rounded focus:ring-primarycolor/20"
                  />
                  <span className="text-sm font-medium text-primarycolor">Products in this category have sizes</span>
                </label>

                {attributeData.has_sizes && (
                  <div className="ml-6 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        placeholder="Add size (e.g., S, M, L, XL)"
                        className="flex-1 px-3 py-2 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 text-primarycolor text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSize()}
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="px-3 py-2 bg-primarycolor text-white rounded-lg hover:bg-primarycolor/90 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>

                    {attributeData.available_sizes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attributeData.available_sizes.map((size, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primarycolor/10 text-primarycolor text-xs rounded-full"
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(size)}
                              className="text-primarycolor/60 hover:text-red-500 transition-colors"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Color Attributes */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={attributeData.has_colors}
                    onChange={(e) => setAttributeData(prev => ({ ...prev, has_colors: e.target.checked }))}
                    className="w-4 h-4 text-primarycolor border-primarycolor/30 rounded focus:ring-primarycolor/20"
                  />
                  <span className="text-sm font-medium text-primarycolor">Products in this category have colors</span>
                </label>

                {attributeData.has_colors && (
                  <div className="ml-6 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="Add color (e.g., Red, Blue, Black)"
                        className="flex-1 px-3 py-2 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 text-primarycolor text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddColor()}
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="px-3 py-2 bg-primarycolor text-white rounded-lg hover:bg-primarycolor/90 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>

                    {attributeData.available_colors.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attributeData.available_colors.map((color, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primarycolor/10 text-primarycolor text-xs rounded-full"
                          >
                            {color}
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(color)}
                              className="text-primarycolor/60 hover:text-red-500 transition-colors"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-primarycolor/10">
          <Button
            type="button"
            onClick={resetForm}
            variant="outline"
            disabled={addCategory.isLoading || updateCategory.isLoading}
          >
            <FiRotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <Button
            type="submit"
            disabled={addCategory.isLoading || updateCategory.isLoading}
            variant="primary"
            className="shadow-lg shadow-primarycolor/30"
          >
            {addCategory.isLoading || updateCategory.isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4 mr-2" />
                {category ? "Update Category" : "Create Category"}
              </>
            )}
          </Button>
        </div>
      </form>
    </PremiumCard>
  );
}
