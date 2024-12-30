"use client";
import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function DesktopFilter({ categories, onApplyFilters, initialFilters }) {
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

  const handleApply = () => {
    onApplyFilters({
      priceRange,
      categories: selectedCategories,
      tags: selectedTags
    });
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      setTimeout(() => {
        onApplyFilters({
          priceRange,
          categories: newCategories,
          tags: selectedTags
        });
      }, 0);
      
      return newCategories;
    });
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      
      setTimeout(() => {
        onApplyFilters({
          priceRange,
          categories: selectedCategories,
          tags: newTags
        });
      }, 0);
      
      return newTags;
    });
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    setTimeout(() => {
      onApplyFilters({
        priceRange: value,
        categories: selectedCategories,
        tags: selectedTags
      });
    }, 0);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-primarycolor mb-6">Filters</h3>
        
        {/* Price Range Section */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-primarycolor mb-4">Price Range</h4>
          <Slider
            range
            min={0}
            max={10000}
            value={priceRange}
            onChange={handlePriceChange}
            className="mb-4"
            trackStyle={[{ backgroundColor: 'var(--primarycolor)' }]}
            handleStyle={[
              { borderColor: 'var(--primarycolor)', backgroundColor: 'white' },
              { borderColor: 'var(--primarycolor)', backgroundColor: 'white' }
            ]}
            railStyle={{ backgroundColor: '#E5E7EB' }}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Ksh. {priceRange[0]}</span>
            <span>Ksh. {priceRange[1]}</span>
          </div>
        </div>
          {/* Tags Section */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-primarycolor mb-4">Tags</h4>
            <div className="space-y-3">
              {tags.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="rounded border-primarycolor text-primarycolor focus:ring-primarycolor"
                  />
                  <span className="text-sm text-primarycolor group-hover:text-secondarycolor transition-colors">
                    {tag}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-primarycolor mb-4">Categories</h4>
            <div className="space-y-3">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-primarycolor text-primarycolor focus:ring-primarycolor"
                  />
                  <span className="text-sm text-primarycolor group-hover:text-secondarycolor transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}
