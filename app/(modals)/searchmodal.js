"use client"
import { useState } from 'react';
import Image from 'next/image';
import { Search, X } from 'lucide-react'; // For the search icon
import { useSupabaseContext } from '../context/supabaseContext';
import Link from 'next/link';

export default function SearchModal({ closeModal }) {
  const { fetchProducts } = useSupabaseContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]); // For the floating suggestions list
  const [results, setResults] = useState([]); // For search results
  const [showResults, setShowResults] = useState(false); // Toggle between input and result view

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      // Assuming fetchProducts() fetches all products from the database
      const allProducts = await fetchProducts();

      // Filter suggestions based on input
      const filteredSuggestions = allProducts.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );

      setSuggestions(filteredSuggestions.slice(0, 5)); // Limit suggestions to 5
    } else {
      setSuggestions([]); // Clear suggestions if input is cleared
    }
  };

  const handleSearch = async () => {
    const allProducts = await fetchProducts();
    const filteredResults = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filteredResults);
    setShowResults(true); // Display results on search
  };

  return (
    <div className="fixed inset-0 bg-white p-4 z-50 overflow-y-auto">
      {/* Close Button */}
      <button onClick={closeModal} className="absolute top-4 right-4 text-warningcolor">
        <X />
      </button>

      {/* Initial Search Input */}
      {!showResults && (
        <div className="relative mt-8">
          <div className="relative flex items-center border-2 border-primarycolor rounded-full p-1 mb-4">
            {/* Search Icon */}
            <Search className="h-6 w-6 text-primarycolor ml-2" />

            {/* Input Field */}
            <input
              type="text"
              placeholder="Search Products..."
              value={searchTerm}
              onChange={handleInputChange}
              className="w-full p-2 pl-3 rounded-full outline-none text-primarycolor"
              style={{
                fontSize: '1rem',
                fontWeight: 'thin',
                color: '#6B21A8',  // Matching the purple theme from the design
              }}
            />
          </div>

          {/* Floating Suggestion List */}
          {searchTerm && suggestions.length > 0 && (
            <div className="absolute w-full bg-white border border-primarycolor rounded-lg mt-1 shadow-lg z-10">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSearchTerm(suggestion.name);
                    handleSearch(); // Trigger search when suggestion is clicked
                  }}
                  className="p-3 hover:bg-primarycolor cursor-pointer"
                >
                  {suggestion.name}
                </div>
              ))}
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full bg-primarycolor text-white py-2 rounded-full mt-4 text-lg"
            style={{
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            Search
          </button>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="mt-8">
          {results.length === 0 ? (
            <p className="text-center text-secondarycolor">No results found for &quot;{searchTerm}&quot;.</p>
          ) : (
            <div>
              {results.map((product) => (
                <Link href={`/product/${product.id}`} key={product.id} className="flex items-center justify-between p-4 mb-2 border-b">
                  <div>
                    <p className="font-bold text-primarycolor">{product.name}</p>
                    <p className="text-gray-600 line-through">Ksh. {product.originalPrice}</p>
                    <p className="text-secondarycolor">Ksh. {product.price}</p>
                  </div>

                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={64}  // 16 * 4 = 64px
                    height={64} // 16 * 4 = 64px
                    className="object-cover rounded"
                  />

                </Link>
              ))}
            </div>
          )}

          {/* Back to Search Button */}
          <button
            onClick={() => setShowResults(false)}
            className="mt-4 w-full bg-primarycolor text-white py-2 rounded-full"
          >
            Back to Search
          </button>
        </div>
      )}
    </div>
  );
}
