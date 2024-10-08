"use client";
import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export default function ProductForm({ product, categories, onSave }) {
  const { addProduct, updateProduct, uploadProductImage } = useSupabase();
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category_id || '');
  const [price, setPrice] = useState(product?.price || '');
  const [inventory, setInventory] = useState(product?.quantity || '');
  const [discount, setDiscount] = useState(product?.discount || '');
  const [imageFile, setImageFile] = useState(null); // Store the image file
  const [isSubmitting, setIsSubmitting] = useState(false); // Handle form submission state

  // Default to the existing image URL if editing, or empty string if adding new product
  let imageUrl = product?.image_url || ''; 

  // Handle the image file selection
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable form to prevent multiple submissions

    // If there's an image file, upload it to Supabase bucket and get the URL
    if (imageFile) {
      try {
        imageUrl = await uploadProductImage(imageFile); // Upload and get the public URL
        console.log('Image URL:', imageUrl); // Debug to check if imageUrl is set
      } catch (error) {
        console.error('Error uploading image:', error.message);
        setIsSubmitting(false); // Re-enable the form in case of failure
        return;
      }
    }

    // Construct the product data
    const productData = {
      name,
      description,
      category_id: category,
      category_name: categories.find(cat => cat.id === parseInt(category))?.name || '',
      price,
      quantity: inventory,
      discount,
      wishlist_count: product?.wishlist_count || 0, // Default to 0 if it's a new product
    };

    // Only include image_url if it exists (after successful upload or from editing)
    if (imageUrl) {
      productData.image_url = imageUrl;
    }

    if (product) {
      // Update the existing product
      await updateProduct(product.id, productData);
    } else {
      // Add new product
      await addProduct(productData);
    }

    onSave(); // Trigger the onSave callback to refresh the product list
    setIsSubmitting(false); // Re-enable the form
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border"
        required
      />

      <textarea
        placeholder="Product Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border"
        required
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border"
        required
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-2 border"
        required
      />

      <input
        type="number"
        placeholder="Inventory"
        value={inventory}
        onChange={(e) => setInventory(e.target.value)}
        className="w-full p-2 border"
        required
      />

      <input
        type="number"
        placeholder="Discount (%)"
        value={discount}
        onChange={(e) => setDiscount(e.target.value)}
        className="w-full p-2 border"
      />

      {/* Image Upload Field */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full p-2 border"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded"
        disabled={isSubmitting} // Disable button when submitting
      >
        {isSubmitting ? 'Submitting...' : product ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
}
