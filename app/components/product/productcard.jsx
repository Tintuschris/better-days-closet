// components/product/ProductCard.js
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ id, name, price, discountPrice, imagePath }) {
  return (
    <Link href={`/product/${id}`} className="block">
      <div className="border rounded-lg overflow-hidden">
        <Image
          src={imagePath}
          alt={name}
          width={300}
          height={300}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h2 className="text-sm font-semibold">{name}</h2>
          <div className="flex justify-between items-center mt-2">
            {discountPrice ? (
              <>
                <span className="text-red-500 font-bold">Ksh. {discountPrice}</span>
                <span className="text-gray-500 line-through text-sm">Ksh. {price}</span>
              </>
            ) : (
              <span className="font-bold">Ksh. {price}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}