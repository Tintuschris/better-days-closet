"use client"
import { Home, Search, Heart, User } from 'lucide-react';
import Link from 'next/link';

export default function FloatingNavBar({ activeIcon, setActiveIcon }) {
  return (
    <nav className="fixed text-primarycolor bottom-0 left-0 w-full bg-white shadow-lg border-t p-4 flex justify-around">
      {/* Home Icon */}
      <button onClick={() => setActiveIcon('home')} className="text-center">
        <Link href="/">
          <Home className={`h-6 w-6 mx-auto ${activeIcon === 'home' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
          <p className="text-xs">Home</p>
        </Link>
      </button>

      {/* Search Icon */}
      <button onClick={() => setActiveIcon('search')} className="text-center">
        <Link href="/search">
          <Search className={`h-6 w-6 mx-auto ${activeIcon === 'search' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
          <p className="text-xs">Search</p>
        </Link>
      </button>

      {/* Wishlist Icon */}
      <button onClick={() => setActiveIcon('wishlist')} className="text-center">
        <Link href="/wishlist">
          <Heart className={`h-6 w-6 mx-auto ${activeIcon === 'wishlist' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
          <p className="text-xs">Wishlist</p>
        </Link>
      </button>

      {/* Profile Icon */}
      <button onClick={() => setActiveIcon('profile')} className="text-center">
        <Link href="/profile">
          <User className={`h-6 w-6 mx-auto ${activeIcon === 'profile' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
          <p className="text-xs">Profile</p>
        </Link>
      </button>
    </nav>
  );
}
