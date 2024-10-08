import Link from 'next/link';
import Image from 'next/image';
export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="relative w-full h-48 mb-4">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
      <p className="text-gray-500">Ksh. {product.price}</p>
      <Link href={`/product/${product.id}`} className="text-blue-500 mt-4 inline-block">View Details</Link>
    </div>
  );
}
