"use client";
import { useState, useRef } from "react";
import { useSupabase } from "../hooks/useSupabase";
import { toast } from "sonner";
import { FiUpload, FiX, FiDollarSign, FiPackage, FiPercent } from "react-icons/fi";
import Image from "next/image";

export default function ProductForm({ categories }) {
  const { useAddProduct, useUpdateProduct, useUploadImage } = useSupabase();
  const addMutation = useAddProduct();
  const updateMutation = useUpdateProduct();
  const uploadMutation = useUploadImage();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    quantity: "",
    discount: "0",
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageClick = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      if (formData.imageFile) {
        imageUrl = await uploadMutation.mutateAsync(formData.imageFile);
      }

      const productData = {
        ...formData,
        image_url: imageUrl,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        discount: parseInt(formData.discount),
      };

      delete productData.imageFile;

      await addMutation.mutateAsync(productData);
      toast.success("Product added successfully");
      resetForm();
    } catch (error) {
      toast.error("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      price: "",
      quantity: "",
      discount: "0",
      image_url: "",
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <div className="p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-primarycolor/80 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2.5 border border-primarycolor/20 rounded-md focus:ring-2 focus:ring-primarycolor/50 focus:border-primarycolor/50 text-primarycolor/90 bg-white/50"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-primarycolor/80 mb-1">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-2.5 border border-primarycolor/20 rounded-md focus:ring-2 focus:ring-primarycolor/50 focus:border-primarycolor/50 text-primarycolor/90 bg-white/50"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-primarycolor/80 mb-1">
              Price (KES)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiDollarSign className="h-5 w-5 text-primarycolor/40" />
              </div>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className="w-full pl-10 p-2.5 border border-primarycolor/20 rounded-md focus:ring-2 focus:ring-primarycolor/50 focus:border-primarycolor/50 text-primarycolor/90 bg-white/50"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-primarycolor/80 mb-1">
              Quantity
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPackage className="h-5 w-5 text-primarycolor/40" />
              </div>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full pl-10 p-2.5 border border-primarycolor/20 rounded-md focus:ring-2 focus:ring-primarycolor/50 focus:border-primarycolor/50 text-primarycolor/90 bg-white/50"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-primarycolor/80 mb-1">
              Discount (%)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPercent className="h-5 w-5 text-primarycolor/40" />
              </div>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full pl-10 p-2.5 border border-primarycolor/20 rounded-md focus:ring-2 focus:ring-primarycolor/50 focus:border-primarycolor/50 text-primarycolor/90 bg-white/50"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-primarycolor/80 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full p-2.5 border border-primarycolor/20 rounded-md focus:ring-2 focus:ring-primarycolor/50 focus:border-primarycolor/50 text-primarycolor/90 bg-white/50"
            placeholder="Enter product description"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-primarycolor/80 mb-1">
            Product Image
          </label>
          <div
            onClick={handleImageClick}
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-primarycolor/20 border-dashed rounded-md cursor-pointer hover:border-primarycolor/50 transition-colors"
          >
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="relative inline-block">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={128}
                    height={128}
                    className="mx-auto h-32 w-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setFormData((prev) => ({ ...prev, imageFile: null }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-0 right-0 -mr-2 -mt-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FiUpload className="mx-auto h-12 w-12 text-primarycolor/40" />
                  <p className="mt-2 text-sm text-primarycolor/60">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-primarycolor/50">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-primarycolor/10">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2.5 border border-primarycolor/30 rounded-md text-primarycolor/70 bg-white hover:bg-primarycolor/5 font-medium transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primarycolor text-white rounded-md hover:bg-primarycolor/70 font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );}
