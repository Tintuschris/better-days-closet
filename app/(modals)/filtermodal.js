import React, { useState } from 'react';

export default function FilterModal({ categories = [], onApplyFilters, closeModal }) {
  const [priceRange, setPriceRange] = useState([100, 2500]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [selectedTags, setSelectedTags] = useState({
    'Top Deals': false,
    'New Arrivals': false
  });

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleTagChange = (tag) => {
    setSelectedTags(prev => ({
      ...prev,
      [tag]: !prev[tag]
    }));
  };

  const applyFilters = () => {
    onApplyFilters({
      priceRange,
      categories: Object.keys(selectedCategories).filter(key => selectedCategories[key]),
      tags: Object.keys(selectedTags).filter(key => selectedTags[key])
    });
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-purple-900 text-white p-4 z-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">FILTERS</h1>
        <button onClick={closeModal} className="text-2xl">&times;</button>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h2 className="mb-2">Price</h2>
        <input
          type="range"
          min="100"
          max="2500"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([100, parseInt(e.target.value)])}
          className="w-full"
        />
        <div className="flex justify-between">
          <span>Ksh.{priceRange[0]}</span>
          <span>Ksh.{priceRange[1]}</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h2 className="mb-2">Category</h2>
        {['Men', 'Women', 'Kids', 'Shoes', 'Kitchenware', 'Electronics'].map((category) => (
          <div key={category} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={category}
              checked={selectedCategories[category] || false}
              onChange={() => handleCategoryChange(category)}
              className="mr-2"
            />
            <label htmlFor={category}>{category}</label>
          </div>
        ))}
      </div>

      {/* Tags Filter */}
      <div className="mb-6">
        <h2 className="mb-2">Tags</h2>
        {Object.keys(selectedTags).map((tag) => (
          <div key={tag} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={tag}
              checked={selectedTags[tag]}
              onChange={() => handleTagChange(tag)}
              className="mr-2"
            />
            <label htmlFor={tag}>{tag}</label>
          </div>
        ))}
      </div>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="w-full bg-pink-500 text-white py-2 rounded-full"
      >
        Apply
      </button>
    </div>
  );
}