"use client"
import { useEffect, useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { useRouter } from 'next/router';

export default function ProductPage() {
  const { fetchProductById, addToCart } = useSupabase();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchProductById(id).then(data => setProduct(data));
    }
  }, [id]);

  const handleAddToCart = async () => {
    await addToCart(1, product.id, quantity); // Assuming user ID 1 for now
    alert('Product added to cart');
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <img src={product.image_url} alt={product.name} className="w-full h-64 object-cover mb-4" />
      <p className="text-lg">Ksh. {product.price}</p>
      <p className="text-gray-700 mb-4">{product.description}</p>

      <div className="flex space-x-2">
        <button onClick={() => setQuantity(quantity - 1)} className="bg-gray-200 px-4 py-2">-</button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity(quantity + 1)} className="bg-gray-200 px-4 py-2">+</button>
      </div>

      <button onClick={handleAddToCart} className="mt-4 bg-blue-500 text-white px-4 py-2">Add to Cart</button>
    </div>
  );
}
