"use client";
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';
import { useSupabase } from '../hooks/useSupabase';
import { useEffect, useState } from 'react';

export default function ProductManagement() {
  const { fetchCategories } = useSupabase();
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // Track selected product for editing

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Handle when a product is selected for editing
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
  };

  // Refresh the product list and clear the form
  const handleSave = () => {
    setSelectedProduct(null); // Clear the selected product after saving
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-primarycolor">Manage Products</h1>

      {/* Pass the selected product for editing */}
      <ProductForm product={selectedProduct} categories={categories} onSave={handleSave} />
      
      {/* Pass handleEditProduct to ProductTable */}
      <ProductTable onEdit={handleEditProduct} />
    </div>
  );
}