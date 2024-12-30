import Link from "next/link";
import { useSupabaseContext } from "../context/supabaseContext";

export default function CategoryListing() {
  const { categories } = useSupabaseContext();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-primarycolor">CATEGORIES</h2>
      <div className="flex gap-2 overflow-x-auto md:overflow-visible md:flex-col scrollbar-hide">
        {categories?.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.name}`}
            className="block text-center md:text-left p-[0.35rem] bg-secondarycolor text-primarycolor h-[34px] rounded-primaryradius border border-primarycolor text-sm font-medium flex-grow min-w-[100px] md:min-w-0 md:w-full md:h-auto md:py-3 md:px-4 hover:bg-primarycolor hover:text-secondarycolor transition-colors md:flex md:items-center md:justify-between"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}