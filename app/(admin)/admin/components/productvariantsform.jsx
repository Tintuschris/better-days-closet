"use client";
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '../hooks/useSupabase';
import { toast } from 'sonner';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiUpload, FiMenu, FiStar } from 'react-icons/fi';
import Image from 'next/image';
import ImageUploadOptimizer from './ImageUploadOptimizer';
import { supabase } from '../../../lib/supabase';
import ConfirmModal from '../../../components/ui/ConfirmModal';

export default function ProductVariantsForm({ productId, product }) {
  const { 
    useProductVariants, 
    useAddProductVariant, 
    useUpdateProductVariant, 
    useDeleteProductVariant,
    useUploadProductImage 
  } = useSupabase();
  const queryClient = useQueryClient();
  
  const { data: variants, isLoading } = useProductVariants(productId);
  const addMutation = useAddProductVariant();
  const updateMutation = useUpdateProductVariant();
  const deleteMutation = useDeleteProductVariant();
  const uploadMutation = useUploadProductImage();
  const [gallery, setGallery] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmDeleteVariantId, setConfirmDeleteVariantId] = useState(null);
  const [confirmVariantText, setConfirmVariantText] = useState('');
  const [confirmVariantInput, setConfirmVariantInput] = useState('');
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

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

  // Load existing gallery for this product
  useEffect(() => {
    const loadGallery = async () => {
      if (!productId) return;
      try {
        const { data, error } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', productId)
          .order('sort_order', { ascending: true });
        if (error) throw error;
        setGallery(data || []);
      } catch (err) {
        console.error('Failed to load gallery', err);
      }
    };
    loadGallery();
  }, [productId]);

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

  const setPrimary = async (index) => {
    // Move selected image to the first position and persist order
    if (index <= 0 || index >= gallery.length) return;
    setSavingOrder(true);
    try {
      const updated = [...gallery];
      const [moved] = updated.splice(index, 1);
      updated.unshift(moved);
      const withOrder = updated.map((img, i) => ({ ...img, sort_order: i }));
      setGallery(withOrder);
      await persistSortOrder(withOrder);
      await syncPrimaryImageToProduct(withOrder);
      toast.success('Primary image set');
      refreshAfterGalleryChange();
    } catch (err) {
      toast.error('Failed to set primary image');
    } finally {
      setSavingOrder(false);
    }
  };

  // Keyboard-accessible reordering on focused tile
  const onKeyDownTile = async (e, index) => {
    if (!reorderMode) return;
    const key = e.key;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) return;
    e.preventDefault();
    let direction = 0;
    if (key === 'ArrowLeft' || key === 'ArrowUp') direction = -1;
    if (key === 'ArrowRight' || key === 'ArrowDown') direction = 1;
    if (direction === 0) return;
    // Perform move locally first, then persist
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= gallery.length) return;
    setSavingOrder(true);
    try {
      const updated = [...gallery];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);
      const withOrder = updated.map((img, i) => ({ ...img, sort_order: i }));
      setGallery(withOrder);
      await persistSortOrder(withOrder);
      await syncPrimaryImageToProduct(withOrder);
      refreshAfterGalleryChange();
    } catch (err) {
      toast.error('Failed to reorder');
    } finally {
      setSavingOrder(false);
    }
  };

  const persistSortOrder = async (ordered) => {
    // Write sequential sort_order matching array indices
    for (let i = 0; i < ordered.length; i++) {
      const img = ordered[i];
      if (img.sort_order !== i) {
        const { error } = await supabase.from('product_images').update({ sort_order: i }).eq('id', img.id);
        if (error) throw error;
      }
    }
  };

  const toggleReorderMode = () => {
    setReorderMode((prev) => !prev);
    setDragIndex(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setConfirmBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase.from('product_images').delete().in('id', ids);
      if (error) throw error;
      const next = (gallery || []).filter(img => !selectedIds.has(img.id));
      setGallery(next);
      await syncPrimaryImageToProduct(next);
      clearSelection();
      toast.success('Selected images deleted');
      refreshAfterGalleryChange();
    } catch (err) {
      toast.error('Failed to delete selected images');
    } finally {
      setConfirmBulkDeleteOpen(false);
    }
  };

  const onDragStart = (e, index) => {
    if (!reorderMode) return;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, index) => {
    if (!reorderMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = async (e, dropIndex) => {
    if (!reorderMode) return;
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;
    setSavingOrder(true);
    try {
      const updated = [...gallery];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, moved);
      // Update local sort_order to match new order
      const withOrder = updated.map((img, i) => ({ ...img, sort_order: i }));
      setGallery(withOrder);
      await persistSortOrder(withOrder);
      await syncPrimaryImageToProduct(withOrder);
      refreshAfterGalleryChange();
    } catch (err) {
      toast.error('Failed to reorder');
    } finally {
      setSavingOrder(false);
      setDragIndex(null);
    }
  };

  // Add uploaded images to gallery table and state
  const addGalleryImages = async (urls) => {
    try {
      if (!Array.isArray(urls) || urls.length === 0) return;
      const start = gallery.length;
      const records = urls.map((url, i) => ({ product_id: productId, url, sort_order: start + i }));
      const { data, error } = await supabase
        .from('product_images')
        .insert(records)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const newGallery = [...gallery, ...(data || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setGallery(newGallery);
      await syncPrimaryImageToProduct(newGallery);
      refreshAfterGalleryChange();
    } catch (err) {
      console.error('Failed to add gallery images', err);
      toast.error('Failed to add images to gallery');
    }
  };

  const moveGalleryImage = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= gallery.length) return;
    setSavingOrder(true);
    try {
      const updated = [...gallery];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);
      const withOrder = updated.map((img, i) => ({ ...img, sort_order: i }));
      setGallery(withOrder);
      await persistSortOrder(withOrder);
      await syncPrimaryImageToProduct(withOrder);
      refreshAfterGalleryChange();
    } catch (err) {
      console.error('Failed to move image', err);
      toast.error('Failed to move image');
    } finally {
      setSavingOrder(false);
    }
  };

  const removeGalleryImage = async (id) => {
    try {
      const { error } = await supabase.from('product_images').delete().eq('id', id);
      if (error) throw error;
      const next = (gallery || []).filter((g) => g.id !== id);
      setGallery(next);
      await syncPrimaryImageToProduct(next);
      toast.success('Image removed');
      refreshAfterGalleryChange();
    } catch (err) {
      console.error('Failed to remove image', err);
      toast.error('Failed to remove image');
    }
  };

  const syncPrimaryImageToProduct = async (images) => {
    try {
      const primaryUrl = images && images.length > 0 ? images[0].url : null;
      const { error } = await supabase
        .from('products')
        .update({ image_url: primaryUrl })
        .eq('id', productId);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to sync primary image to product', err);
    }
  };

  const refreshAfterGalleryChange = () => {
    // Refresh product lists/views that display the main image
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
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
    // Provide immediate feedback and debugging info
    console.debug('ProductVariantsForm.handleSubmit triggered', { formData, productId, editingVariant });
    toast.info('Saving variant...');
    
    if (!productId) {
      toast.error('Product ID is required to add variants');
      return;
    }
    
    if (!formData.price || !formData.quantity) {
      toast.error('Price and quantity are required');
      return;
    }

    // Upload image if selected (legacy path). ImageUploadOptimizer handles upload automatically.
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
      // Invalidate precise variant list for this product so UI updates
      queryClient.invalidateQueries({ queryKey: ['admin-product-variants', productId] });
      // Invalidate global variants list used by the public product page hook
      queryClient.invalidateQueries({ queryKey: ['product_variants'] });
      // Also refresh products lists that might show derived info
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      resetForm();
    } catch (error) {
      console.error('ProductVariantsForm.handleSubmit error', error);
      toast.error(`Failed to save variant: ${error?.message || String(error)}`);
    }
  };

  const handleDelete = async (variantId) => {
    const v = variants?.find(x => x.id === variantId);
    const label = [v?.size, v?.color].filter(Boolean).join(' / ') || 'Default Variant';
    setConfirmVariantText(label);
    setConfirmVariantInput('');
    setConfirmDeleteVariantId(variantId);
  };

  const confirmDeleteVariant = async () => {
    if (!confirmDeleteVariantId) return;
    try {
      await deleteMutation.mutateAsync(confirmDeleteVariantId);
      toast.success('Variant deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-product-variants', productId] });
      // Invalidate global variants list used by the public product page hook
      queryClient.invalidateQueries({ queryKey: ['product_variants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch (error) {
      toast.error('Failed to delete variant');
    } finally {
      setConfirmDeleteVariantId(null);
    }
  };

  if (!productId) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Please create the product first before adding variants and managing the gallery.
        </p>
      </div>
    );
  }

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
      <ConfirmModal
        open={confirmBulkDeleteOpen}
        title="Delete Selected Images"
        description={`Are you sure you want to delete ${selectedIds.size} selected image(s) from the gallery?`}
        onCancel={() => setConfirmBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        confirmLabel="Delete"
        variant="danger"
      />
      <ConfirmModal
        open={!!confirmDeleteVariantId}
        title="Delete Variant"
        description={`Are you sure you want to delete ${confirmVariantText}?`}
        typeToConfirmText={confirmVariantText}
        confirmInput={confirmVariantInput}
        onConfirmInputChange={setConfirmVariantInput}
        onCancel={() => setConfirmDeleteVariantId(null)}
        onConfirm={confirmDeleteVariant}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isLoading}
      />
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

          {/* Image Upload (Optimized, consistent with Step 1) */}
          <div>
            <label className="block text-sm font-medium text-primarycolor mb-2">Variant Image <span className="text-xs text-primarycolor/60">(Specific to this variant)</span></label>
            <ImageUploadOptimizer
              onImagesUploaded={(urls) => {
                const first = Array.isArray(urls) && urls.length > 0 ? urls[0] : null;
                if (first) setFormData(prev => ({ ...prev, image_url: first }));
              }}
              maxImages={1}
              existingImages={formData.image_url ? [{ id: 0, url: formData.image_url, originalName: 'variant-image', optimized: true }] : []}
              uploadFunction={async (file) => {
                const url = await uploadMutation.mutateAsync(file);
                return url;
              }}
            />
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
              onClick={() => {
                console.debug('Add/Update Variant button clicked');
                toast.message('Submitting variant...');
              }}
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

      {/* Manage Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primarycolor">Product Gallery <span className="text-sm font-normal text-primarycolor/60">(Main product images)</span></h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleReorderMode}
              className={`px-3 py-1.5 rounded border text-sm ${reorderMode ? 'bg-primarycolor text-white border-primarycolor' : 'border-primarycolor/30 text-primarycolor hover:bg-primarycolor/5'}`}
              title="Toggle Reorder Mode"
            >
              {reorderMode ? 'Reordering…' : 'Reorder'}
            </button>
            <button
              type="button"
              onClick={bulkDeleteSelected}
              disabled={selectedIds.size === 0}
              className={`px-3 py-1.5 rounded border text-sm ${selectedIds.size ? 'border-red-500 text-red-600 hover:bg-red-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
              title="Delete selected images"
            >
              Delete Selected ({selectedIds.size})
            </button>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="px-3 py-1.5 rounded border text-sm border-primarycolor/30 text-primarycolor hover:bg-primarycolor/5"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-xs text-primarycolor/70 mb-3">
            Use <strong>Reorder</strong> mode to drag images. You can also use Arrow keys when a tile is focused. Select multiple images to <strong>Delete Selected</strong>. Use <strong>Set Primary</strong> to make an image the first in the gallery.
          </div>
          <ImageUploadOptimizer
            onImagesUploaded={(urls) => addGalleryImages(urls)}
            maxImages={10}
            existingImages={gallery.map((g, idx) => ({ id: g.id, url: g.url, originalName: `image-${idx+1}`, optimized: true }))}
            uploadFunction={async (file) => {
              // Reuse existing server-side upload path
              const url = await uploadMutation.mutateAsync(file);
              return url;
            }}
          />

          {gallery.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {gallery.map((img, index) => (
                <div
                  key={img.id}
                  className={`relative group border rounded-lg overflow-hidden ${dragIndex === index ? 'ring-2 ring-primarycolor' : ''} ${reorderMode ? 'cursor-move' : ''}`}
                  draggable={reorderMode}
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDrop={(e) => onDrop(e, index)}
                  tabIndex={0}
                  role="option"
                  aria-grabbed={reorderMode}
                  onKeyDown={(e) => onKeyDownTile(e, index)}
                  title="Drag to reorder"
                >
                  <Image src={img.url} alt={`Gallery ${index+1}`} width={300} height={300} className="w-full h-40 object-cover" />
                  {/* Drag handle visual cue */}
                  {reorderMode && (
                    <div className="absolute top-2 right-2 bg-white/90 rounded-md px-2 py-1 text-xs flex items-center gap-1 cursor-move">
                      <FiMenu className="w-4 h-4 text-primarycolor" />
                      Drag
                    </div>
                  )}
                  {/* Selection Checkbox */}
                  <label className="absolute top-2 left-2 bg-white/90 rounded-md px-2 py-1 text-xs flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={selectedIds.has(img.id)} onChange={() => toggleSelect(img.id)} />
                    Select
                  </label>
                  <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between bg-black/30 text-white text-xs">
                    <div className="flex gap-2">
                      <button disabled={savingOrder} onClick={() => moveGalleryImage(index, -1)} className="px-2 py-1 bg-white/20 rounded disabled:opacity-50">Up</button>
                      <button disabled={savingOrder} onClick={() => moveGalleryImage(index, 1)} className="px-2 py-1 bg-white/20 rounded disabled:opacity-50">Down</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button disabled={savingOrder || index === 0} onClick={() => setPrimary(index)} className={`px-2 py-1 rounded flex items-center gap-1 ${index === 0 ? 'bg-white/10 cursor-not-allowed opacity-60' : 'bg-white/20 hover:bg-white/30'}`} title="Set as Primary">
                        <FiStar className="w-3 h-3" />
                        Primary
                      </button>
                      <button onClick={() => removeGalleryImage(img.id)} className="px-2 py-1 bg-red-500/80 rounded">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
