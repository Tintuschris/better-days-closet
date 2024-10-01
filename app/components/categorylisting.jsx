export default function CategoryListing({ categories }) {
  return (
    <div className="space-y-4">
      <h2 className="text-md font-semibold">CATEGORIES</h2>
      {/* Make the container horizontally scrollable but hide the scrollbar */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <a
            key={category.id}
            href={`/categories/${category.name}`}
            className="block p-2 bg-secondarycolor text-primarycolor h-[40px] rounded-primaryradius text-center"
          >
            {category.name}
          </a>
        ))}
      </div>
    </div>
  );
}
