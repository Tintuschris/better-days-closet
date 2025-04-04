import Link from "next/link";
import { useSupabaseContext } from "../context/supabaseContext";
import { 
  ShoppingBag, 
  UserRound, 
  Users, 
  Footprints, 
  UtensilsCrossed, 
  Smartphone, 
  Briefcase 
} from "lucide-react";

export default function CategoryListing() {
  const { categories } = useSupabaseContext();

  // Map category names to appropriate icons
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      "Women": <UserRound size={18} />,
      "Men": <UserRound size={18} />,
      "Kids": <Users size={18} />,
      "Shoes": <Footprints size={18} />,
      "Kitchenware": <UtensilsCrossed size={18} />,
      "Electronics": <Smartphone size={18} />,
      "Handbags": <ShoppingBag size={18} />
    };

    // Return the mapped icon or a default icon if not found
    return iconMap[categoryName] || <Briefcase size={18} />;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-primarycolor">CATEGORIES</h2>
      <div className="flex gap-2 overflow-x-auto md:overflow-visible md:flex-col scrollbar-hide">
        {categories?.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.name}`}
            className="block text-center md:text-left p-[0.35rem] bg-secondarycolor text-primarycolor h-[34px] rounded-primaryradius border border-primarycolor text-sm font-medium flex-grow min-w-[100px] md:min-w-0 md:w-full md:h-auto md:py-3 md:px-4 hover:bg-primarycolor hover:text-secondarycolor transition-colors"
          >
            {/* Desktop: Show icon + text with balanced spacing */}
            <span className="hidden md:flex items-center">
              <span className="mr-3">{getCategoryIcon(category.name)}</span>
              {category.name}
            </span>
            
            {/* Mobile: Text only, centered */}
            <span className="md:hidden">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
