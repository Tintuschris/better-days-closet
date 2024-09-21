// components/CategorySlider.tsx
import Link from 'next/link';

const categories = ['Men', 'Women', 'Kids', 'Shoes', 'Kitchenware', 'Electronics'];

export default function CategorySlider() {
  return (
    <div className="overflow-x-auto whitespace-nowrap p-4 bg-gray-100">
      {categories.map((category) => (
        <Link
          key={category}
          href={`/categories/${category.toLowerCase()}`}
          className="inline-block px-4 py-2 mr-2 bg-white rounded-full text-sm"
        >
          {category}
        </Link>
      ))}
    </div>
  );
}