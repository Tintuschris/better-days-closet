export default function ProductCarousel({ title, products }) {
    return (
      <div className="py-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="flex overflow-x-scroll space-x-4">
          {products.map(product => (
            <div key={product.id} className="min-w-[150px] bg-white shadow p-4 rounded-lg">
              <img src={product.image_url} alt={product.name} className="h-24 w-full object-cover mb-2" />
              <p className="text-sm font-semibold">{product.name}</p>
              <p className="text-sm">Ksh. {product.price}</p>
              <a href={`/product/${product.id}`} className="text-blue-500 text-xs">View Details</a>
            </div>
          ))}
        </div>
      </div>
    );
  }
  