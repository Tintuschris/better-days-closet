"use client";
import ProductCard from './productcard';

export default function ProductListing({ products, viewMode = 'grid' }) {
  return (
    <div className={`
      ${viewMode === 'grid' 
        ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6' 
        : 'flex flex-col gap-4 md:gap-6'
      }
    `}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}
