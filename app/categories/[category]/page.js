'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Use useParams instead of router.query
import { useSupabase } from '../../hooks/useSupabase';
import ProductListing from '../../components/ProductListing';

export default function CategoryPage() {
  const { fetchProductsByCategory } = useSupabase();
  const [products, setProducts] = useState([]);
  const { category } = useParams();  // Access dynamic category from the URL

  useEffect(() => {
    if (!category) return;
    fetchProductsByCategory(category).then(setProducts);
  }, [category, fetchProductsByCategory]);

  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-xl font-bold mb-4 capitalize">{category}</h1>
      <ProductListing products={products} />
    </div>
  );
}
