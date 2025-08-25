"use client";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useSupabase } from "../hooks/useSupabase";
import { toast } from "sonner";
import {
  FiUpload, FiX, FiDollarSign, FiPackage, FiPercent, FiStar,
  FiCalendar, FiTag, FiInfo, FiImage, FiSave, FiRotateCcw
} from "react-icons/fi";
import Image from "next/image";
import { Button, Input, FormGroup, Label, PremiumCard, GradientText } from "../../../components/ui";
import ImageUploadOptimizer from "./ImageUploadOptimizer";

export default function ProductForm({ product, onClose, onSuccess, categories }) {
  const initialFormState = useMemo(
    () => ({
      name: "",
      description: "",
      category_id: "",
      price: "",
      discount: "0",
      image_url: [],
      is_promoted: false,
      promotion_start_date: "",
      promotion_end_date: "",
      promotion_type: "",
    }),
    []
  );

  const [imageFiles, setImageFiles] = useState([]);
  const { useAddProduct, useUpdateProduct, useCategories, uploadProductImage } = useSupabase();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const { data: categoriesData } = useCategories();
  const [useOptimizedUpload, setUseOptimizedUpload] = useState(true);

  // Helper function to format date for datetime-local input
  const formatDateForInput = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      // Format as YYYY-MM-DDTHH:MM for datetime-local input
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  }, []);

  // Initialize form with product data if editing
  const [formData, setFormData] = useState(() => {
    if (product) {
      return {
        name: product.name || "",
        description: product.description || "",
        category_id: product.category_id || "",
        price: product.price || "",
        discount: product.discount || "0",
        image_url: Array.isArray(product.image_url) ? product.image_url : (product.image_url ? [product.image_url] : []),
        is_promoted: product.is_promoted || false,
        promotion_start_date: formatDateForInput(product.promotion_start_date),
        promotion_end_date: formatDateForInput(product.promotion_end_date),
        promotion_type: product.promotion_type || "",
      };
    } else {
      return initialFormState;
    }
  });

  // Update form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category_id: product.category_id || "",
        price: product.price || "",
        discount: product.discount || "0",
        image_url: Array.isArray(product.image_url) ? product.image_url : (product.image_url ? [product.image_url] : []),
        is_promoted: product.is_promoted || false,
        promotion_start_date: formatDateForInput(product.promotion_start_date),
        promotion_end_date: formatDateForInput(product.promotion_end_date),
        promotion_type: product.promotion_type || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [product, initialFormState, formatDateForInput]);

  const handleImageDelete = async (indexToDelete) => {
    const updatedImages = formData.image_url.filter(
      (_, index) => index !== indexToDelete
    );
    setFormData((prev) => ({
      ...prev,
      image_url: updatedImages,
    }));
  };

  // Track uploaded images for potential cleanup
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  // Handle optimized image upload
  const handleImagesUploaded = (urls) => {
    setFormData(prev => ({
      ...prev,
      image_url: [...(Array.isArray(prev.image_url) ? prev.image_url : []), ...urls]
    }));
    // Track new uploads for potential cleanup
    setUploadedImageUrls(prev => [...prev, ...urls]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }

    try {
      // Validate that at least one image is uploaded
      if (!formData.image_url || formData.image_url.length === 0) {
        toast.error('Please upload at least one product image');
        return;
      }

      const selectedCategory = categoriesData?.find(cat => cat.id === formData.category_id);

      // Convert empty strings to null for timestamp fields
      const productData = {
        ...formData,
        image_url: formData.image_url,
        category_name: selectedCategory?.name,
        promotion_start_date: formData.promotion_start_date || null,
        promotion_end_date: formData.promotion_end_date || null,
        promotion_type: formData.promotion_type || null,
        // Ensure numeric fields are properly typed
        price: parseFloat(formData.price) || 0,
        quantity: parseInt(formData.quantity) || 0,
        discount: parseFloat(formData.discount) || 0
      };

      if (product) {
        await updateProduct.mutateAsync({ id: product.id, product: productData });
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync(productData);
        toast.success('Product created successfully');
      }

      // Clear form and uploaded images tracking
      setFormData(initialFormState);
      setUploadedImageUrls([]);

      // Call success callback to close form
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      toast.error(`Failed to save product: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setUploadedImageUrls([]);
  };
  
  return (
    <PremiumCard className="overflow-hidden">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-primarycolor to-primarycolor/90 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <GradientText className="text-lg font-semibold text-white flex items-center gap-2">
              <FiPackage className="w-5 h-5" />
              {product ? 'Edit Product' : 'Add New Product'}
            </GradientText>
            <p className="text-white/80 text-sm mt-1">
              {product ? 'Update product information and settings' : 'Fill in the details to create a new product'}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primarycolor mb-4 flex items-center gap-2">
                <FiInfo className="w-4 h-4" />
                Basic Information
              </h4>

              <div className="space-y-4">
                <FormGroup>
                  <Label required>Product Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label required>Description</Label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-primarycolor/30 rounded-xl focus:border-primarycolor focus:outline-none transition-colors resize-none text-primarycolor"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label required>Category</Label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-primarycolor/30 rounded-xl focus:border-primarycolor focus:outline-none transition-colors text-primarycolor bg-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {categoriesData?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & Inventory */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primarycolor mb-4 flex items-center gap-2">
                <FiDollarSign className="w-4 h-4" />
                Pricing & Inventory
              </h4>

              <div className="space-y-4">
                <FormGroup>
                  <Label required>Price (KSh)</Label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="pl-10"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </FormGroup>

                {/* Inventory Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Inventory quantities are managed through product variants.
                    After creating this product, you can add variants with specific sizes, colors, and quantities.
                  </p>
                </div>

                <div>
                  <FormGroup>
                    <Label>Discount (%)</Label>
                    <div className="relative">
                      <FiPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
                      <Input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        placeholder="0"
                        className="pr-10"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                  </FormGroup>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="col-span-1 lg:col-span-2 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-primarycolor mb-4 flex items-center gap-2">
              <FiImage className="w-4 h-4" />
              Product Images
            </h4>

            <ImageUploadOptimizer
              onImagesUploaded={handleImagesUploaded}
              maxImages={10}
              existingImages={Array.isArray(formData.image_url) ? formData.image_url.map((url, index) => ({
                id: index,
                url,
                originalName: `image-${index + 1}`
              })) : []}
              uploadFunction={uploadProductImage}
            />
          </div>
        </div>

        {/* Promotion Settings */}
        <div className="col-span-1 lg:col-span-2 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-primarycolor mb-4 flex items-center gap-2">
              <FiStar className="w-4 h-4" />
              Promotion Settings
            </h4>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-primarycolor/20">
                <input
                  type="checkbox"
                  id="is_promoted"
                  checked={formData.is_promoted}
                  onChange={(e) => setFormData({ ...formData, is_promoted: e.target.checked })}
                  className="w-4 h-4 text-primarycolor border-primarycolor/30 rounded focus:ring-primarycolor/20"
                />
                <div>
                  <label htmlFor="is_promoted" className="text-sm font-medium text-primarycolor">
                    Promote this product
                  </label>
                  <p className="text-xs text-primarycolor/60">Featured products appear in promotional sections</p>
                </div>
              </div>

              {formData.is_promoted && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup>
                    <Label>Promotion Start Date</Label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
                      <input
                        type="datetime-local"
                        value={formData.promotion_start_date || ""}
                        onChange={(e) => setFormData({ ...formData, promotion_start_date: e.target.value || null })}
                        className="w-full pl-10 px-4 py-3 border-2 border-primarycolor/30 rounded-xl focus:border-primarycolor focus:outline-none transition-colors text-primarycolor"
                      />
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <Label>Promotion End Date</Label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
                      <input
                        type="datetime-local"
                        value={formData.promotion_end_date || ""}
                        onChange={(e) => setFormData({ ...formData, promotion_end_date: e.target.value || null })}
                        className="w-full pl-10 px-4 py-3 border-2 border-primarycolor/30 rounded-xl focus:border-primarycolor focus:outline-none transition-colors text-primarycolor"
                      />
                    </div>
                  </FormGroup>

                  <div className="md:col-span-2">
                    <FormGroup>
                      <Label>Promotion Type</Label>
                      <select
                        value={formData.promotion_type}
                        onChange={(e) => setFormData({ ...formData, promotion_type: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-primarycolor/30 rounded-xl focus:border-primarycolor focus:outline-none transition-colors text-primarycolor bg-white"
                      >
                        <option value="">Select Promotion Type</option>
                        <option value="flash_sale">Flash Sale</option>
                        <option value="featured">Featured Product</option>
                        <option value="clearance">Clearance</option>
                      </select>
                    </FormGroup>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="col-span-1 lg:col-span-2 pt-6 border-t border-primarycolor/10">
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              disabled={addProduct.isLoading || updateProduct.isLoading}
            >
              <FiRotateCcw className="w-4 h-4 mr-2" />
              Reset Form
            </Button>

            <Button
              type="submit"
              disabled={addProduct.isLoading || updateProduct.isLoading}
              variant="primary"
              className="shadow-lg shadow-primarycolor/30"
            >
              {addProduct.isLoading || updateProduct.isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2" />
                  {product ? "Update Product" : "Create Product"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </PremiumCard>
  );
}
