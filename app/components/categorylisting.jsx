import Link from "next/link";
import { useSupabaseContext } from "../context/supabaseContext";
import {
  ShoppingBagIcon as ShoppingBag,
  UserIcon as UserRound,
  UsersIcon as Users,
  HomeIcon as Footprints,
  CubeIcon as UtensilsCrossed,
  DevicePhoneMobileIcon as Smartphone,
  BriefcaseIcon as Briefcase
} from "@heroicons/react/24/outline";

export default function CategoryListing() {
  const { categories } = useSupabaseContext();

  // Map category names to appropriate icons
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      "Women": <UserRound className="w-6 h-6 lg:w-8 lg:h-8" />,
      "Men": <UserRound className="w-6 h-6 lg:w-8 lg:h-8" />,
      "Kids": <Users className="w-6 h-6 lg:w-8 lg:h-8" />,
      "Shoes": <Footprints className="w-6 h-6 lg:w-8 lg:h-8" />,
      "Kitchenware": <UtensilsCrossed className="w-6 h-6 lg:w-8 lg:h-8" />,
      "Electronics": <Smartphone className="w-6 h-6 lg:w-8 lg:h-8" />,
      "Handbags": <ShoppingBag className="w-6 h-6 lg:w-8 lg:h-8" />
    };

    // Return the mapped icon or a default icon if not found
    return iconMap[categoryName] || <Briefcase className="w-6 h-6 lg:w-8 lg:h-8" />;
  };

  return (
    <div className="space-y-4">
      {/* Header with See All button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-primarycolor">Categories</h2>
        <Link
          href="/categories"
          className="text-sm text-primarycolor hover:text-secondarycolor transition-colors font-medium"
        >
          See All →
        </Link>
      </div>

      {/* Mobile: Horizontal Scrolling Pills */}
      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {categories?.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.name}`}
              className="flex-shrink-0 px-4 py-2 bg-secondarycolor text-primarycolor rounded-full text-sm font-medium hover:bg-primarycolor hover:text-secondarycolor transition-colors whitespace-nowrap"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: Clean Horizontal Pills */}
      <div className="hidden md:block">
        <div className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide pb-2">
          {categories?.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.name}`}
              className="flex-shrink-0 px-6 py-3 lg:px-8 lg:py-4 bg-secondarycolor text-primarycolor rounded-full text-sm lg:text-base font-medium hover:bg-primarycolor hover:text-secondarycolor transition-colors whitespace-nowrap"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
