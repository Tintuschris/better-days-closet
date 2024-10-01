import { useState } from 'react';

export default function FilterModal({ categories, onApplyFilters, closeModal }) {
  const [priceRange, setPriceRange] = useState([0, 2500]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState('');

  const applyFilters = () => {
    onApplyFilters({
      priceRange,
      category: selectedCategory,
      tags: tags.split(',').map(tag => tag.trim()),
    });
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-white p-4">
      <h1 className="text-lg font-bold mb-4">Filters</h1>

      {/* Price Filter */}
      <label className="block mb-2">Price Range</label>
      <input
        type="range"
        min="100"
        max="2500"
        value={priceRange}
        onChange={(e) => setPriceRange([100, e.target.value])}
        className="w-full"
      />
      <p>Ksh. {priceRange[0]} - Ksh. {priceRange[1]}</p>

      {/* Category Filter */}
      <label className="block mt-4 mb-2">Category</label>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">All Categories</option>
        {categories.map(category => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Tags Filter */}
      <label className="block mt-4 mb-2">Tags</label>
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Enter tags separated by commas"
        className="w-full p-2 border rounded"
      />

      {/* Apply Filters Button */}
      <button
        onClick={applyFilters}
        className="w-full bg-blue-500 text-white py-2 mt-4"
      >
        Apply Filters
      </button>
      <button onClick={closeModal} className="w-full bg-gray-500 text-white py-2 mt-4">
        Close
      </button>
    </div>
  );
}
