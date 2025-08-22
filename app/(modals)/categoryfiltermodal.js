"use client"
import { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function CategoryFilterModal({ onApplyFilters, closeModal, initialFilters }) {
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [availability, setAvailability] = useState('all');
  
  const ratings = [5, 4, 3, 2, 1];

  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.priceRange && Array.isArray(initialFilters.priceRange)) {
        setPriceRange(initialFilters.priceRange);
      }
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

  const handleReset = () => {
    setPriceRange([0, 10000]);
    setSelectedRatings([]);
    setAvailability('all');
    onApplyFilters({});
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-end md:items-center justify-center p-4">
        <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md mx-auto shadow-2xl transform transition-all duration-300">
          {/* Enhanced Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-primarycolor">Refine Results</h2>
              <p className="text-sm text-gray-600 mt-1">Find exactly what you're looking for</p>
            </div>
            <button 
              onClick={closeModal}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Enhanced Price Range Section */}
            <div>
              <h3 className="text-lg font-semibold text-primarycolor mb-4 flex items-center">
                <span className="w-2 h-2 bg-secondarycolor rounded-full mr-3"></span>
                Price Range
              </h3>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="px-2 py-4">
                  <Slider
                    range
                    min={0}
                    max={10000}
                    step={100}
                    value={priceRange}
                    onChange={setPriceRange}
                    className="mb-6"
                    trackStyle={[{ 
                      backgroundColor: '#460066', 
                      height: '8px',
                      borderRadius: '4px'
                    }]}
                    handleStyle={[
                      { 
                        borderColor: '#460066', 
                        backgroundColor: '#460066', 
                        boxShadow: '0 4px 12px rgba(70, 0, 102, 0.4)',
                        width: '24px',
                        height: '24px',
                        marginTop: '-8px',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        cursor: 'pointer'
                      },
                      { 
                        borderColor: '#460066', 
                        backgroundColor: '#460066', 
                        boxShadow: '0 4px 12px rgba(70, 0, 102, 0.4)',
                        width: '24px',
                        height: '24px',
                        marginTop: '-8px',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        cursor: 'pointer'
                      }
                    ]}
                    railStyle={{ 
                      backgroundColor: '#E5E7EB', 
                      height: '8px',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="bg-white px-3 py-2 rounded-xl border border-gray-200">
                    <span className="text-sm font-semibold text-primarycolor">Ksh. {(priceRange?.[0] || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-gray-400">-</div>
                  <div className="bg-white px-3 py-2 rounded-xl border border-gray-200">
                    <span className="text-sm font-semibold text-primarycolor">Ksh. {(priceRange?.[1] || 10000).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Ratings Section */}
            <div>
              <h3 className="text-lg font-semibold text-primarycolor mb-4 flex items-center">
                <span className="w-2 h-2 bg-secondarycolor rounded-full mr-3"></span>
                Customer Rating
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {ratings.map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingToggle(rating)}
                    className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                      selectedRatings.includes(rating)
                        ? 'bg-primarycolor text-white border-primarycolor shadow-lg'
                        : 'border-gray-200 text-primarycolor hover:border-primarycolor hover:bg-primarycolor/5'
                    }`}
                  >
                    <span>{rating} Stars & Above</span>
                    <div className="flex">
                      {[...Array(rating)].map((_, i) => (
                        <span key={i} className={selectedRatings.includes(rating) ? 'text-yellow-300' : 'text-yellow-400'}>★</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Availability Section */}
            <div>
              <h3 className="text-lg font-semibold text-primarycolor mb-4 flex items-center">
                <span className="w-2 h-2 bg-secondarycolor rounded-full mr-3"></span>
                Availability
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAvailability('all')}
                  className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${
                    availability === 'all'
                      ? 'bg-primarycolor text-white border-primarycolor shadow-lg'
                      : 'border-gray-200 text-primarycolor hover:border-primarycolor hover:bg-primarycolor/5'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setAvailability('inStock')}
                  className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${
                    availability === 'inStock'
                      ? 'bg-primarycolor text-white border-primarycolor shadow-lg'
                      : 'border-gray-200 text-primarycolor hover:border-primarycolor hover:bg-primarycolor/5'
                  }`}
                >
                  In Stock
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-all duration-200"
              >
                Reset Filters
              </button>
              
              {/* Apply Button */}
              <button
                onClick={handleApply}
                className="w-full py-4 bg-gradient-to-r from-primarycolor to-purple-700 text-white rounded-2xl font-semibold hover:from-primarycolor/90 hover:to-purple-700/90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center"
              >
                <Filter className="w-5 h-5 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
