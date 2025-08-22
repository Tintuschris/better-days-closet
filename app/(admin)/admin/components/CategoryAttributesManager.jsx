"use client";
import { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { FiPlus, FiTrash2, FiSave, FiX, FiTag, FiGrid } from 'react-icons/fi';
import { PremiumCard, Button, GradientText } from '../../../components/ui';

export default function CategoryAttributesManager({ category, onClose, onSuccess }) {
  const { useCreateCategoryAttributes, useUpdateCategoryAttributes } = useSupabase();
  
  const [attributes, setAttributes] = useState({
    has_sizes: false,
    has_colors: false,
    available_sizes: [],
    available_colors: []
  });

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  const createAttributesMutation = useCreateCategoryAttributes();
  const updateAttributesMutation = useUpdateCategoryAttributes();

  useEffect(() => {
    if (category?.attributes) {
      setAttributes({
        has_sizes: category.attributes.has_sizes || false,
        has_colors: category.attributes.has_colors || false,
        available_sizes: category.attributes.available_sizes || [],
        available_colors: category.attributes.available_colors || []
      });
    }
  }, [category]);

  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const defaultColors = [
    'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 
    'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Navy'
  ];

  const addSize = () => {
    if (newSize.trim() && !attributes.available_sizes.includes(newSize.trim())) {
      setAttributes(prev => ({
        ...prev,
        available_sizes: [...prev.available_sizes, newSize.trim()]
      }));
      setNewSize('');
    }
  };

  const removeSize = (size) => {
    setAttributes(prev => ({
      ...prev,
      available_sizes: prev.available_sizes.filter(s => s !== size)
    }));
  };

  const addColor = () => {
    if (newColor.trim() && !attributes.available_colors.includes(newColor.trim())) {
      setAttributes(prev => ({
        ...prev,
        available_colors: [...prev.available_colors, newColor.trim()]
      }));
      setNewColor('');
    }
  };

  const removeColor = (color) => {
    setAttributes(prev => ({
      ...prev,
      available_colors: prev.available_colors.filter(c => c !== color)
    }));
  };

  const addDefaultSizes = () => {
    setAttributes(prev => ({
      ...prev,
      available_sizes: [...new Set([...prev.available_sizes, ...defaultSizes])]
    }));
  };

  const addDefaultColors = () => {
    setAttributes(prev => ({
      ...prev,
      available_colors: [...new Set([...prev.available_colors, ...defaultColors])]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const attributeData = {
        category_id: category.id,
        has_sizes: attributes.has_sizes,
        has_colors: attributes.has_colors,
        available_sizes: attributes.available_sizes,
        available_colors: attributes.available_colors
      };

      if (category.attributes?.id) {
        await updateAttributesMutation.mutateAsync({
          id: category.attributes.id,
          ...attributeData
        });
        toast.success('Category attributes updated successfully');
      } else {
        await createAttributesMutation.mutateAsync(attributeData);
        toast.success('Category attributes created successfully');
      }
      
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error saving category attributes:', error);
      toast.error('Failed to save category attributes');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <GradientText className="text-xl font-semibold">
            Manage Attributes for "{category?.name}"
          </GradientText>
          <p className="text-primarycolor/70 mt-1">
            Configure size and color options for products in this category
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Size Attributes */}
          <PremiumCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primarycolor flex items-center gap-2">
                <FiGrid className="w-5 h-5" />
                Size Attributes
              </h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={attributes.has_sizes}
                  onChange={(e) => setAttributes(prev => ({ ...prev, has_sizes: e.target.checked }))}
                  className="rounded border-gray-300 text-primarycolor focus:ring-primarycolor"
                />
                <span className="text-sm text-primarycolor">Enable Sizes</span>
              </label>
            </div>

            {attributes.has_sizes && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Add size (e.g., XL, 42, Large)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primarycolor focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                  />
                  <Button type="button" onClick={addSize} variant="outline" size="sm">
                    <FiPlus className="w-4 h-4" />
                  </Button>
                  <Button type="button" onClick={addDefaultSizes} variant="outline" size="sm">
                    Add Default
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {attributes.available_sizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primarycolor/10 text-primarycolor rounded-full text-sm"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="text-primarycolor/70 hover:text-red-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </PremiumCard>

          {/* Color Attributes */}
          <PremiumCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primarycolor flex items-center gap-2">
                <FiTag className="w-5 h-5" />
                Color Attributes
              </h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={attributes.has_colors}
                  onChange={(e) => setAttributes(prev => ({ ...prev, has_colors: e.target.checked }))}
                  className="rounded border-gray-300 text-primarycolor focus:ring-primarycolor"
                />
                <span className="text-sm text-primarycolor">Enable Colors</span>
              </label>
            </div>

            {attributes.has_colors && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Add color (e.g., Navy Blue, Forest Green)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primarycolor focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  />
                  <Button type="button" onClick={addColor} variant="outline" size="sm">
                    <FiPlus className="w-4 h-4" />
                  </Button>
                  <Button type="button" onClick={addDefaultColors} variant="outline" size="sm">
                    Add Default
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {attributes.available_colors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primarycolor/10 text-primarycolor rounded-full text-sm"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="text-primarycolor/70 hover:text-red-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </PremiumCard>

          {/* Preview */}
          {(attributes.has_sizes || attributes.has_colors) && (
            <PremiumCard className="p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-primarycolor mb-2">Preview</h4>
              <p className="text-xs text-primarycolor/70 mb-3">
                Products in this category will have these variant options:
              </p>
              <div className="space-y-2">
                {attributes.has_sizes && (
                  <div>
                    <span className="text-xs font-medium text-primarycolor">Sizes: </span>
                    <span className="text-xs text-primarycolor/70">
                      {attributes.available_sizes.join(', ') || 'None'}
                    </span>
                  </div>
                )}
                {attributes.has_colors && (
                  <div>
                    <span className="text-xs font-medium text-primarycolor">Colors: </span>
                    <span className="text-xs text-primarycolor/70">
                      {attributes.available_colors.join(', ') || 'None'}
                    </span>
                  </div>
                )}
              </div>
            </PremiumCard>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createAttributesMutation.isPending || updateAttributesMutation.isPending}
              className="flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              Save Attributes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
