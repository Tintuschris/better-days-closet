import Link from "next/link";
export default function CategoryListing({ categories }) {
  return (
    <div className="space-y-4 ">
      <h2 className="text-md font-medium text-primarycolor">CATEGORIES</h2>
      {/* Make the container horizontally scrollable but hide the scrollbar */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.name}`}
            className="block p-[0.35rem] bg-secondarycolor text-primarycolor h-[34px] rounded-primaryradius border border-primarycolor text-sm text-center font-medium flex-grow min-w-[100px]"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
