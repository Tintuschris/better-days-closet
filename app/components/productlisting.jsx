import ProductCard from './productcard';

export default function ProductListing({ products }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
