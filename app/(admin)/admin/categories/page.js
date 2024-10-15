"use client";
import { useEffect, useState } from 'react';
import CategoryForm from '../components/CategoryForm';
import { useSupabase } from '../hooks/useSupabase'; // Adjust import path if necessary

export default function CategoryManagement() {
  const { fetchCategories } = useSupabase();
  const [categories, setCategories] = useState([]);

  // Define the onSave function to refresh categories after saving a new category
  const handleSave = () => {
    fetchCategories().then(setCategories); // Refresh the list of categories
  };

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-primarycolor">Manage Categories</h1>
      {/* Pass handleSave as onSave prop to CategoryForm */}
      <CategoryForm onSave={handleSave} />
      {/* <h1 className="text-2xl font-bold mb-4 text-primarycolor">Current Categories</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 text-secondarycolor">
        {categories.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul> */}
    </div>
  );
}
