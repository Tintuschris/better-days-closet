import { useSupabaseContext } from '../context/supabaseContext';
import { Phone, PinIcon } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const { categories } = useSupabaseContext();

  return (
    <footer className="bg-primarycolor text-white px-8 py-12">
      {/* Location and Contact Section */}
      <div className="mb-8">
        <h2 className="text-lg mb-4 font-bold text-secondarycolor text-center">Better Days Closet - Shop F64 - Left Wing -First Floor - RNG Towers</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 text-secondarycolor fill-secondarycolor pr-8"><PinIcon /></div>
            <p>Located Along Ronald Ngala Street</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 text-secondarycolor fill-seconadrycolor pr-8"><Phone /></div>
            <p>0712345678/ 0723456789</p>
          </div>
        </div>
      </div>

      {/* Categories and Links Section */}
      <div className="grid grid-cols-2 gap-8 mb-8 border-t border-white/20 pt-8">
        {/* Categories */}
        <div>
          <h3 className="text-lg font-medium mb-4">Categories</h3>
          <ul className="space-y-2 font-normal">
            {categories?.map((category) => (
              <li key={category.id}>
                <Link href={`/categories/${category.name.toLowerCase()}`} className="hover:text-secondarycolor">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Useful Links */}
        <div className="text-right">
          <h3 className="text-lg font-medium mb-4">Useful Links</h3>
          <ul className="space-y-2 font-normal">
            <li><Link href="/support" className="hover:text-pink-300">Support</Link></li>
            <li><Link href="/about" className="hover:text-pink-300">About Us</Link></li>
            <li><Link href="/privacy" className="hover:text-pink-300">Privacy Policy</Link></li>
          </ul>
        </div>      
        </div>
      {/* Social Media Links */}
      <div className="flex justify-center gap-6 mb-8 border-t border-white/20 pt-8">
        <Link href="#" className="bg-white rounded-full p-2 hover:bg-pink-300 transition-colors">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#581C87' }}>
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </Link>
        <Link href="#" className="bg-white rounded-full p-2 hover:bg-pink-300 transition-colors">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#581C87' }}>
            <path d="M19.59 7.603c.479-.479 1.116-1.168 1.116-2.109 0-1.167-.946-2.114-2.114-2.114-1.168 0-2.114.947-2.114 2.114 0 .941.637 1.63 1.116 2.109-.479.479-1.116 1.168-1.116 2.109 0 1.167.946 2.114 2.114 2.114 1.168 0 2.114-.947 2.114-2.114 0-.941-.637-1.63-1.116-2.109zM12 15c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
            <path d="M16.5 0h-9A7.5 7.5 0 0 0 0 7.5v9A7.5 7.5 0 0 0 7.5 24h9a7.5 7.5 0 0 0 7.5-7.5v-9A7.5 7.5 0 0 0 16.5 0zM12 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" />
          </svg>
        </Link>
        <Link href="#" className="bg-white rounded-full p-2 hover:bg-pink-300 transition-colors">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#581C87' }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </Link>
      </div>

      {/* Copyright */}
      <div className="text-center">
        <p>BETTER DAYS CLOSET© 2024. All Rights Reserved.</p>
      </div>
    </footer>
  );
}