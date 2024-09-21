// components/layout/BottomNavigation.js
import Link from 'next/link';
import { Home, Search, Heart, User } from 'lucide-react';

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="flex justify-around items-center p-2">
        <Link href="/" className="flex flex-col items-center">
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center">
          <Search className="w-6 h-6" />
          <span className="text-xs">Search</span>
        </Link>
        <Link href="/wishlist" className="flex flex-col items-center">
          <Heart className="w-6 h-6" />
          <span className="text-xs">Wishlist</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center">
          <User className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
}