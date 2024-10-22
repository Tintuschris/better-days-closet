"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSupabaseContext } from '../../context/supabaseContext';
import ProductListing from '../../components/productlisting';

export default function CategoryPage() {
  const { fetchProductsByCategory } = useSupabaseContext();
  const [products, setProducts] = useState([]);
  const { category } = useParams();

  useEffect(() => {
    if (category) {
      fetchProductsByCategory(category).then(setProducts);
    }
  }, [category, fetchProductsByCategory]);

  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-xl font-bold mb-4 text-primarycolor capitalize">{category}</h1>
      <ProductListing products={products} />
    </div>
  );
}
