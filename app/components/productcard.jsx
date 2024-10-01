import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover mb-4" />
      <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
      <p className="text-gray-500">Ksh. {product.price}</p>
      <Link href={`/product/${product.id}`} className="text-blue-500 mt-4 inline-block">View Details</Link>
    </div>
  );
}
