import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';

export default function SearchModal({ closeModal }) {
  const { fetchProducts } = useSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const allProducts = await fetchProducts();
    const filteredProducts = allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filteredProducts);
  };

  return (
    <div className="fixed inset-0 bg-white p-4">
      <input
        type="text"
        placeholder="Search for products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button onClick={handleSearch} className="w-full bg-blue-500 text-white py-2">
        Search
      </button>
      <button onClick={closeModal} className="mt-4 w-full bg-gray-500 text-white py-2">
        Close
      </button>

      <div className="mt-4">
        {results.map(product => (
          <div key={product.id} className="p-2 border-b">
            <p>{product.name}</p>
            <p>Ksh. {product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
