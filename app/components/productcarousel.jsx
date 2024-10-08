import Image from "next/image";
export default function ProductCarousel({ title, products }) {
  return (
    <div className="py-4">
      <h2 className="text-md font-medium text-primarycolor">{title}</h2>
      <div className="flex overflow-x-scroll space-x-4">
        {products.map(product => (
          <div key={product.id} className="min-w-[150px] bg-white shadow p-4 rounded-lg">
            <div className="relative h-24 w-full mb-2">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-sm font-semibold">{product.name}</p>
            <p className="text-sm">Ksh. {product.price}</p>
            <a href={`/product/${product.id}`} className="text-blue-500 text-xs">View Details</a>
          </div>
        ))}
      </div>
    </div>
  );
}
