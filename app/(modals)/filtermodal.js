"use client"
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function FilterModal({ categories, onApplyFilters, closeModal, initialFilters }) {
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const tags = ['Top Deals', 'New Arrivals'];

  useEffect(() => {
    if (initialFilters) {
      setPriceRange(initialFilters.priceRange);
      setSelectedCategories(initialFilters.categories);
      setSelectedTags(initialFilters.tags);
    }
  }, [initialFilters]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      priceRange,
      categories: selectedCategories,
      tags: selectedTags
    });
    closeModal();
  };

  const handleClearAll = () => {
    setPriceRange([0, 10000]);
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primarycolor">Filters</h2>
          <button onClick={closeModal}>
            <X className="h-6 w-6 text-primarycolor" />
          </button>
        </div>

        {/* Price Range Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-primarycolor mb-4">Price Range</h3>
          <Slider
            range
            min={0}
            max={10000}
            value={priceRange}
            onChange={setPriceRange}
            className="mb-4"
            trackStyle={[{ backgroundColor: 'var(--primarycolor)' }]}
            handleStyle={[
              { borderColor: 'var(--primarycolor)', backgroundColor: 'white' },
              { borderColor: 'var(--primarycolor)', backgroundColor: 'white' }
            ]}
            railStyle={{ backgroundColor: '#E5E7EB' }}
          />
          <div className="flex justify-between text-sm text-primarycolor">
            <span>Ksh. {priceRange[0]}</span>
            <span>Ksh. {priceRange[1]}</span>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-primarycolor mb-4">Categories</h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`p-2 rounded-lg border text-sm transition-colors ${
                  selectedCategories.includes(category)
                    ? 'bg-primarycolor text-white border-primarycolor'
                    : 'border-gray-300 text-primarycolor hover:border-primarycolor'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-primarycolor mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primarycolor text-white'
                    : 'bg-gray-100 text-primarycolor hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategories.length > 0 || selectedTags.length > 0) && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-primarycolor">Active Filters</h3>
              <button
                onClick={handleClearAll}
                className="text-sm text-warningcolor hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-gray-100 text-primarycolor rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-primarycolor rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="w-full py-3 bg-primarycolor text-white rounded-full hover:bg-opacity-90 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
