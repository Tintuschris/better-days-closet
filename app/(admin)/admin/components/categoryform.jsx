"use client";
import { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export default function CategoryForm({ onSave }) {
  const { addCategory, updateCategory, fetchCategories, deleteCategory } = useSupabase();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // For editing
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);

  // Fetch categories on initial load
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, [fetchCategories]);

  // Handle edit category (prefill form with selected category)
  const handleEdit = (category) => {
    setSelectedCategory(category); // Set the category to be edited
    setName(category.name); // Prefill the name field
    setQuantity(category.quantity); // Prefill the quantity field
  };

  // Handle form submission for adding or updating category
  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryData = { name, quantity };

    if (selectedCategory) {
      // Update existing category
      await updateCategory(selectedCategory.id, categoryData);
    } else {
      // Add new category
      await addCategory(categoryData);
    }

    // Refresh categories and reset form
    handleSave();
  };

  // Define the onSave function to refresh categories after saving a new category
  const handleSave = async () => {
    const fetchedCategories = await fetchCategories();
    setCategories(fetchedCategories); // Refresh the list of categories
    setSelectedCategory(null); // Reset selected category
    setName(''); // Clear name field
    setQuantity(0); // Clear quantity field
    onSave(); // Call parent function to refresh page
  };

  // Handle delete category
  const handleDelete = async (id) => {
    await deleteCategory(id);
    handleSave(); // Refresh categories after delete
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 text-primarycolor">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border"
          required
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-2 border"
          required
        />

        <button type="submit" className="bg-primarycolor text-white p-4 rounded-primaryradius">
          {selectedCategory ? 'Update Category' : 'Add Category'}
        </button>
      </form>

      <ul className="space-y-2 mt-4 text-secondarycolor">
        {categories.map((category) => (
          <li key={category.id} className="flex justify-between items-center">
            <span>
              {category.name} - Quantity: {category.quantity}
            </span>
            <div>
              {/* Edit button */}
              <button
                onClick={() => handleEdit(category)}
                className="bg-primarycolor text-white px-4 py-2 rounded mr-2"
              >
                Edit
              </button>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(category.id)}
                className="bg-warningcolor text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
