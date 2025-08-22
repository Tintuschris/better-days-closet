"use client";
import { useState, useEffect, useMemo } from "react";
import { useSupabase } from "../hooks/useSupabase";
import { toast } from "sonner";
import {
  FiSave, FiX, FiPlus, FiTrash2, FiPackage, FiDollarSign, 
  FiTag, FiImage, FiRotateCcw, FiGrid, FiList
} from "react-icons/fi";
import { Button, Input, FormGroup, Label, PremiumCard, GradientText } from "../../../components/ui";
import ImageUploadOptimizer from "./ImageUploadOptimizer";

export default function EnhancedProductForm({ product, onClose, onSuccess }) {
  const { useAddProduct, useUpdateProduct, useCategories, useAddProductVariant, useUpdateProductVariant } = useSupabase();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const addVariant = useAddProductVariant();
  const updateVariant = useUpdateProductVariant();
  const { data: categories } = useCategories();

  // Basic product data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    image_url: []
  });

  // Selected category attributes
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Product variants
  const [variants, setVariants] = useState([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);

  // New variant form
  const [newVariant, setNewVariant] = useState({
    size: "",
    color: "",
    price: "",
    quantity: "",
    image_url: ""
  });

  // Initialize form data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category_id: product.category_id || "",
        image_url: product.image_url || []
      });
      
      // Load existing variants
      if (product.variants) {
        setVariants(product.variants);
      }
    }
  }, [product]);

  // Update selected category when category_id changes
  useEffect(() => {
    if (formData.category_id && categories) {
      const category = categories.find(cat => cat.id === formData.category_id);
      setSelectedCategory(category);
    }
  }, [formData.category_id, categories]);

  // Handle adding/updating variants
  const handleSaveVariant = () => {
    if (!newVariant.price || !newVariant.quantity) {
      toast.error("Price and quantity are required");
      return;
    }

    // Check for duplicate variants
    const isDuplicate = variants.some(variant => 
      variant.size === newVariant.size && 
      variant.color === newVariant.color &&
      (!editingVariant || variant.id !== editingVariant.id)
    );

    if (isDuplicate) {
      toast.error("A variant with this size and color combination already exists");
      return;
    }

    if (editingVariant) {
      // Update existing variant
      setVariants(variants.map(variant => 
        variant.id === editingVariant.id 
          ? { ...variant, ...newVariant }
          : variant
      ));
      setEditingVariant(null);
    } else {
      // Add new variant
      const variantId = Date.now().toString(); // Temporary ID
      setVariants([...variants, { ...newVariant, id: variantId }]);
    }

    // Reset form
    setNewVariant({
      size: "",
      color: "",
      price: "",
      quantity: "",
      image_url: ""
    });
    setShowVariantForm(false);
  };

  const handleEditVariant = (variant) => {
    setNewVariant({
      size: variant.size || "",
      color: variant.color || "",
      price: variant.price || "",
      quantity: variant.quantity || "",
      image_url: variant.image_url || ""
    });
    setEditingVariant(variant);
    setShowVariantForm(true);
  };

  const handleDeleteVariant = (variantId) => {
    setVariants(variants.filter(variant => variant.id !== variantId));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.category_id) {
      toast.error("Please select a category");
      return;
    }

    if (variants.length === 0) {
      toast.error("Please add at least one product variant");
      return;
    }

    try {
      let productData = {
        ...formData,
        variants: variants
      };

      if (product) {
        await updateProduct.mutateAsync({
          id: product.id,
          product: productData
        });
        toast.success("Product updated successfully");
      } else {
        await addProduct.mutateAsync(productData);
        toast.success("Product created successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(`Failed to save product: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      image_url: []
    });
    setVariants([]);
    setNewVariant({
      size: "",
      color: "",
      price: "",
      quantity: "",
      image_url: ""
    });
    setShowVariantForm(false);
    setEditingVariant(null);
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
              {product ? 'Update product information and variants' : 'Create a new product with variants'}
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
          {/* Basic Product Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-primarycolor mb-4 flex items-center gap-2">
              <FiTag className="w-4 h-4" />
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup>
                <Label required>Product Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label required>Category</Label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primarycolor/30 rounded-xl focus:border-primarycolor focus:outline-none transition-colors text-primarycolor"
                  required
                >
                  <option value="">Select a category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
                className="w-full px-4 py-3 border-2 border-primarycolor/30 rounded-xl focus:border-primarycolor focus:outline-none transition-colors resize-none text-primarycolor"
              />
            </FormGroup>

            {/* Product Images */}
            <FormGroup>
              <Label>Product Images</Label>
              <ImageUploadOptimizer
                images={formData.image_url}
                onImagesChange={(images) => setFormData({ ...formData, image_url: images })}
                maxImages={5}
              />
            </FormGroup>
          </div>

          {/* Product Variants Section */}
          {selectedCategory?.category_attributes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-primarycolor flex items-center gap-2">
                  <FiGrid className="w-4 h-4" />
                  Product Variants
                </h4>
                <Button
                  type="button"
                  onClick={() => setShowVariantForm(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Variant
                </Button>
              </div>

              {/* Existing Variants */}
              {variants.length > 0 && (
                <div className="space-y-3 mb-4">
                  {variants.map((variant) => (
                    <div key={variant.id} className="bg-white rounded-lg p-3 border border-primarycolor/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm">
                              {selectedCategory.category_attributes.has_sizes && variant.size && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  Size: {variant.size}
                                </span>
                              )}
                              {selectedCategory.category_attributes.has_colors && variant.color && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  Color: {variant.color}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-primarycolor/70">
                              <span>Price: KES {parseFloat(variant.price || 0).toLocaleString()}</span>
                              <span>Stock: {variant.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditVariant(variant)}
                            className="text-primarycolor hover:text-primarycolor/80 transition-colors"
                          >
                            <FiTag className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Variant Form */}
              {showVariantForm && (
                <div className="bg-white rounded-lg p-4 border border-primarycolor/20">
                  <h5 className="font-medium text-primarycolor mb-3">
                    {editingVariant ? 'Edit Variant' : 'Add New Variant'}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCategory.category_attributes.has_sizes && (
                      <FormGroup>
                        <Label>Size</Label>
                        <select
                          value={newVariant.size}
                          onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                          className="w-full px-3 py-2 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 text-primarycolor"
                        >
                          <option value="">Select size</option>
                          {selectedCategory.category_attributes.available_sizes?.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </FormGroup>
                    )}

                    {selectedCategory.category_attributes.has_colors && (
                      <FormGroup>
                        <Label>Color</Label>
                        <select
                          value={newVariant.color}
                          onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                          className="w-full px-3 py-2 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 text-primarycolor"
                        >
                          <option value="">Select color</option>
                          {selectedCategory.category_attributes.available_colors?.map((color) => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </FormGroup>
                    )}

                    <FormGroup>
                      <Label required>Price (KES)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newVariant.price}
                        onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label required>Quantity</Label>
                      <Input
                        type="number"
                        value={newVariant.quantity}
                        onChange={(e) => setNewVariant({ ...newVariant, quantity: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </FormGroup>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowVariantForm(false);
                        setEditingVariant(null);
                        setNewVariant({
                          size: "",
                          color: "",
                          price: "",
                          quantity: "",
                          image_url: ""
                        });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveVariant}
                      variant="primary"
                      size="sm"
                    >
                      {editingVariant ? 'Update' : 'Add'} Variant
                    </Button>
                  </div>
                </div>
              )}

              {variants.length === 0 && !showVariantForm && (
                <div className="text-center py-8 text-primarycolor/60">
                  <FiPackage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No variants added yet</p>
                  <p className="text-sm">Add variants with different sizes, colors, and pricing</p>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-primarycolor/10">
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              disabled={addProduct.isLoading || updateProduct.isLoading}
            >
              <FiRotateCcw className="w-4 h-4 mr-2" />
              Reset
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
