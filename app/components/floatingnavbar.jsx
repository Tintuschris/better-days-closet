'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  HomeIcon as Home,
  HeartIcon as Heart,
  UserIcon as User,
  ClipboardDocumentListIcon as Orders
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

export default function FloatingNavBar({ activeIcon, setActiveIcon, isVisible }) {
  return (
    <Suspense fallback={<NavBarSkeleton />}>
      <FloatingNavBarContent 
        activeIcon={activeIcon} 
        setActiveIcon={setActiveIcon} 
        isVisible={isVisible} 
      />
    </Suspense>
  );
}

function NavBarSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-xl border-t border-gray-100 p-4 flex justify-around z-50">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex flex-col items-center space-y-1">
          <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-8 h-2 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function FloatingNavBarContent({ activeIcon, setActiveIcon, isVisible }) {
  const { user } = useAuth();

  return (
    <nav
      className={`fixed text-primarycolor bottom-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-xl border-t border-gray-100 px-2 py-3 flex justify-around z-50 transition-all duration-300 md:hidden ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <Link href="/" prefetch className="flex-1">
        <div className="text-center p-2 rounded-xl transition-all duration-200 hover:bg-gray-50 active:scale-95">
          <Home className={`h-5 w-5 mx-auto transition-colors duration-200 ${activeIcon === 'home' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
          <p className={`text-xs mt-1 font-medium transition-colors duration-200 ${activeIcon === 'home' ? 'text-secondarycolor' : 'text-primarycolor'}`}>Home</p>
        </div>
      </Link>

      <Link href="/wishlist" prefetch className="flex-1">
        <div className="text-center p-2 rounded-xl transition-all duration-200 hover:bg-gray-50 active:scale-95">
          <Heart className={`h-5 w-5 mx-auto transition-colors duration-200 ${activeIcon === 'wishlist' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
          <p className={`text-xs mt-1 font-medium transition-colors duration-200 ${activeIcon === 'wishlist' ? 'text-secondarycolor' : 'text-primarycolor'}`}>Wishlist</p>
        </div>
      </Link>

      <Link href="/track-order" prefetch className="flex-1">
        <div className="text-center p-2 rounded-xl transition-all duration-200 hover:bg-gray-50 active:scale-95">
          <Orders className={`h-5 w-5 mx-auto transition-colors duration-200 ${activeIcon === 'orders' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
          <p className={`text-xs mt-1 font-medium transition-colors duration-200 ${activeIcon === 'orders' ? 'text-secondarycolor' : 'text-primarycolor'}`}>Orders</p>
        </div>
      </Link>

      <Link href="/profile" prefetch className="flex-1">
        <div className="text-center p-2 rounded-xl transition-all duration-200 hover:bg-gray-50 active:scale-95">
          <User className={`h-5 w-5 mx-auto transition-colors duration-200 ${activeIcon === 'profile' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
          <p className={`text-xs mt-1 font-medium transition-colors duration-200 ${activeIcon === 'profile' ? 'text-secondarycolor' : 'text-primarycolor'}`}>Profile</p>
        </div>
      </Link>
    </nav>
  );
}
