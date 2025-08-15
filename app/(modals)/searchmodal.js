"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  MagnifyingGlassIcon as Search,
  XMarkIcon as X,
  ClockIcon as Clock,
  ArrowRightIcon as ArrowRight
} from "@heroicons/react/24/outline";
import { useSupabaseContext } from "../context/supabaseContext";
import Link from "next/link";

export default function SearchModal({ closeModal }) {
  const { products } = useSupabaseContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsLoading(true);

    if (value.trim()) {
      const filtered =
        products?.filter(
          (product) =>
            product.name.toLowerCase().includes(value.toLowerCase()) ||
            product.category_name.toLowerCase().includes(value.toLowerCase())
        ) || [];
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
    setIsLoading(false);
  };

  const handleSearch = async (term = searchTerm) => {
    setIsLoading(true);
    const filtered =
      products?.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      ) || [];
    setResults(filtered);
    setShowResults(true);

    // Save to recent searches
    const updatedSearches = [
      term,
      ...recentSearches.filter((s) => s !== term),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-white p-4 z-50 overflow-y-auto">
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-warningcolor"
      >
        <X />
      </button>

      {!showResults && (
        <div className="mt-8">
          <div className="relative flex items-center border-2 border-primarycolor rounded-full p-1 mb-4">
            <Search className="h-6 w-6 text-primarycolor ml-2" />
            <input
              type="text"
              placeholder="Search Products..."
              value={searchTerm}
              onChange={handleInputChange}
              className="w-full p-2 pl-3 rounded-full outline-none text-primarycolor"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primarycolor border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {recentSearches.length > 0 && !searchTerm && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-primarycolor mb-2">
                Recent Searches
              </h3>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(term);
                    handleSearch(term);
                  }}
                  className="flex items-center w-full p-2 hover:bg-gray-50 rounded-lg"
                >
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-primarycolor">{term}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
              ))}
            </div>
          )}

          {searchTerm && suggestions.length > 0 && (
            <div className="absolute w-full bg-white border border-primarycolor rounded-lg mt-1 shadow-lg z-10">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSearchTerm(suggestion.name);
                    handleSearch(suggestion.name);
                  }}
                  className="p-3 hover:bg-gray-50 cursor-pointer flex items-center"
                >
                  <Image
                    src={suggestion.image_url}
                    alt={suggestion.name}
                    width={40}
                    height={40}
                    className="rounded-md mr-3"
                  />
                  <div>
                    <p className="text-primarycolor font-medium">
                      {suggestion.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {suggestion.category_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showResults && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-primarycolor">
              Results for &quot;{searchTerm}&quot;
            </h2>
            <button
              onClick={() => setShowResults(false)}
              className="text-primarycolor hover:text-secondarycolor"
            >
              Back to Search
            </button>
          </div>

          {results.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">No results found</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {results.map((product) => (
                <Link
                  href={`/product/${product.id}`}
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  onClick={closeModal}
                >
                  <div className="relative pb-[100%]">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-primarycolor truncate">
                      {product.name}
                    </h3>
                    <p className="text-secondarycolor mt-1">
                      Ksh. {Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
