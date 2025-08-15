"use client";
import { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiUpload } from 'react-icons/fi';
import Image from 'next/image';

export default function ProductVariantsForm({ productId, product }) {
  const { 
    useProductVariants, 
    useAddProductVariant, 
    useUpdateProductVariant, 
    useDeleteProductVariant,
    useUploadImage 
  } = useSupabase();
  
  const { data: variants, isLoading } = useProductVariants(productId);
  const addMutation = useAddProductVariant();
  const updateMutation = useUpdateProductVariant();
  const deleteMutation = useDeleteProductVariant();
  const uploadMutation = useUploadImage();

  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    size: '',
    color: '',
    price: '',
    quantity: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);

  // Get category attributes to determine available sizes and colors
  const category = product?.categories;
  const categoryAttributes = category?.category_attributes?.[0];
  const availableSizes = categoryAttributes?.available_sizes || [];
  const availableColors = categoryAttributes?.available_colors || [];
  const hasVariantSupport = categoryAttributes?.has_sizes || categoryAttributes?.has_colors;

  useEffect(() => {
    if (editingVariant) {
      setFormData({
        size: editingVariant.size || '',
        color: editingVariant.color || '',
        price: editingVariant.price || '',
        quantity: editingVariant.quantity || '',
        image_url: editingVariant.image_url || ''
      });
      setShowForm(true);
    }
  }, [editingVariant]);

  const resetForm = () => {
    setFormData({
      size: '',
      color: '',
      price: product?.price || '',
      quantity: '',
      image_url: ''
    });
    setEditingVariant(null);
    setImageFile(null);
    setShowForm(false);
  };

  const handleImageUpload = async (file) => {
    try {
      const uploadedUrl = await uploadMutation.mutateAsync(file);
      setFormData(prev => ({ ...prev, image_url: uploadedUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.price || !formData.quantity) {
      toast.error('Price and quantity are required');
      return;
    }

    // Upload image if selected
    if (imageFile) {
      await handleImageUpload(imageFile);
    }

    const variantData = {
      product_id: productId,
      size: formData.size || null,
      color: formData.color || null,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      image_url: formData.image_url || null
    };

    try {
      if (editingVariant) {
        await updateMutation.mutateAsync({
          id: editingVariant.id,
          variant: variantData
        });
        toast.success('Variant updated successfully');
      } else {
        await addMutation.mutateAsync(variantData);
        toast.success('Variant added successfully');
      }
      resetForm();
    } catch (error) {
      toast.error('Failed to save variant');
      console.error(error);
    }
  };

  const handleDelete = async (variantId) => {
    if (window.confirm('Are you sure you want to delete this variant?')) {
      try {
        await deleteMutation.mutateAsync(variantId);
        toast.success('Variant deleted successfully');
      } catch (error) {
        toast.error('Failed to delete variant');
      }
    }
  };

  if (!hasVariantSupport) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          This category doesn&apos;t support variants. Configure category attributes first to enable size and color variants.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primarycolor">Product Variants</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primarycolor text-white rounded-lg hover:bg-primarycolor/90"
        >
          <FiPlus />
          Add Variant
        </button>
      </div>

      {/* Variant Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-primarycolor">
              {editingVariant ? 'Edit Variant' : 'Add New Variant'}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Size Selection */}
            {categoryAttributes?.has_sizes && (
              <div>
                <label className="block text-sm font-medium text-primarycolor mb-2">Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  className="w-full p-2 border border-primarycolor/20 rounded focus:ring-2 focus:ring-primarycolor/50"
                >
                  <option value="">Select Size</option>
                  {availableSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Color Selection */}
            {categoryAttributes?.has_colors && (
              <div>
                <label className="block text-sm font-medium text-primarycolor mb-2">Color</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full p-2 border border-primarycolor/20 rounded focus:ring-2 focus:ring-primarycolor/50"
                >
                  <option value="">Select Color</option>
                  {availableColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full p-2 border border-primarycolor/20 rounded focus:ring-2 focus:ring-primarycolor/50"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full p-2 border border-primarycolor/20 rounded focus:ring-2 focus:ring-primarycolor/50"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-primarycolor mb-2">Variant Image</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="flex-1 p-2 border border-primarycolor/20 rounded focus:ring-2 focus:ring-primarycolor/50"
              />
              {formData.image_url && (
                <Image
                  src={formData.image_url}
                  alt="Variant preview"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded border"
                />
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-primarycolor border border-primarycolor/20 rounded hover:bg-primarycolor/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isLoading || updateMutation.isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primarycolor text-white rounded hover:bg-primarycolor/90 disabled:opacity-50"
            >
              <FiSave />
              {editingVariant ? 'Update' : 'Add'} Variant
            </button>
          </div>
        </form>
      )}

      {/* Variants List */}
      <div className="space-y-3">
        {variants?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No variants added yet. Click &quot;Add Variant&quot; to create the first one.
          </div>
        ) : (
          variants?.map((variant) => (
            <div key={variant.id} className="bg-white border border-primarycolor/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {variant.image_url && (
                    <Image
                      src={variant.image_url}
                      alt="Variant"
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  )}
                  <div>
                    <div className="font-medium text-primarycolor">
                      {variant.size && `Size: ${variant.size}`}
                      {variant.size && variant.color && ' • '}
                      {variant.color && `Color: ${variant.color}`}
                      {!variant.size && !variant.color && 'Default Variant'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Price: KSh {variant.price} • Quantity: {variant.quantity}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingVariant(variant)}
                    className="p-2 text-primarycolor hover:bg-primarycolor/10 rounded"
                    title="Edit Variant"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(variant.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete Variant"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
