"use client"
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function CategoryFilterModal({ onApplyFilters, closeModal, initialFilters }) {
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [availability, setAvailability] = useState('all');
  
  const ratings = [5, 4, 3, 2, 1];

  useEffect(() => {
    if (initialFilters) {
      setPriceRange(initialFilters.priceRange);
      setSelectedRatings(initialFilters.ratings || []);
      setAvailability(initialFilters.availability || 'all');
    }
  }, [initialFilters]);

  const handleRatingToggle = (rating) => {
    setSelectedRatings(prev => 
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      priceRange,
      ratings: selectedRatings,
      availability
    });
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primarycolor">Refine Results</h2>
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

        {/* Ratings Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-primarycolor mb-4">Rating</h3>
          <div className="space-y-2">
            {ratings.map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingToggle(rating)}
                className={`w-full p-2 rounded-lg border text-sm transition-colors flex items-center ${
                  selectedRatings.includes(rating)
                    ? 'bg-primarycolor text-white border-primarycolor'
                    : 'border-gray-300 text-primarycolor hover:border-primarycolor'
                }`}
              >
                {rating} Stars & Above
              </button>
            ))}
          </div>
        </div>

        {/* Availability Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-primarycolor mb-4">Availability</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAvailability('all')}
              className={`p-2 rounded-lg border text-sm transition-colors ${
                availability === 'all'
                  ? 'bg-primarycolor text-white border-primarycolor'
                  : 'border-gray-300 text-primarycolor hover:border-primarycolor'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setAvailability('inStock')}
              className={`p-2 rounded-lg border text-sm transition-colors ${
                availability === 'inStock'
                  ? 'bg-primarycolor text-white border-primarycolor'
                  : 'border-gray-300 text-primarycolor hover:border-primarycolor'
              }`}
            >
              In Stock
            </button>
          </div>
        </div>

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
