"use client";
import React, { useState, useEffect } from 'react';
import { useSupabaseContext } from '../context/supabaseContext';

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { fetchProducts } = useSupabaseContext();

  useEffect(() => {
    if (searchTerm) {
      fetchProducts().then(products => {
        const filtered = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
      });
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, fetchProducts]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products..."
      />
      <ul>
        {searchResults.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
