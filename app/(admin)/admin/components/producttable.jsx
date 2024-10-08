"use client";
import { useEffect, useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export default function ProductTable({ onEdit }) {
  const { fetchProducts, deleteProduct } = useSupabase();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  // Handle delete product
  const handleDelete = async (id) => {
    await deleteProduct(id);
    fetchProducts().then(setProducts); // Refresh product list after deletion
  };

  return (
    <table className="w-full table-auto text-primarycolor mt-4">
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Discount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>{product.category_name}</td>
            <td>Ksh. {product.price}</td>
            <td>{product.quantity}</td>
            <td>{product.discount}%</td>
            <td>
              <button
                onClick={() => onEdit(product)} // Pass the selected product for editing
                className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
