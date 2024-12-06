'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Home, Search, Heart, User } from 'lucide-react';
import SearchModal from '../(modals)/searchmodal';
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
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t p-4 flex justify-around z-50">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
      ))}
    </div>
  );
}

function FloatingNavBarContent({ activeIcon, setActiveIcon, isVisible }) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <nav
        className={`fixed text-primarycolor bottom-0 left-0 w-full bg-white shadow-lg border-t p-4 flex justify-around z-50 transition-transform duration-300 md:hidden ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <Link href="/" prefetch>
          <div className="text-center">
            <Home className={`h-6 w-6 mx-auto transition-colors duration-200 ${activeIcon === 'home' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
            <p className={`text-xs transition-colors duration-200 ${activeIcon === 'home' ? 'text-secondarycolor' : 'text-primarycolor'}`}>Home</p>
          </div>
        </Link>

        <button onClick={openModal} className="text-center">
          <Search className="h-6 w-6 mx-auto text-primarycolor" />
          <p className="text-xs text-primarycolor">Search</p>
        </button>

        <Link href="/wishlist" prefetch>
          <div className="text-center">
            <Heart className={`h-6 w-6 mx-auto transition-colors duration-200 ${activeIcon === 'wishlist' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
            <p className={`text-xs transition-colors duration-200 ${activeIcon === 'wishlist' ? 'text-secondarycolor' : 'text-primarycolor'}`}>Wishlist</p>
          </div>
        </Link>

        <Link href={user ? "/profile?tab=orders" : "/auth/login"} prefetch>
          <div className="text-center">
            <User className={`h-6 w-6 mx-auto transition-colors duration-200 ${activeIcon === 'orders' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
            <p className={`text-xs transition-colors duration-200 ${activeIcon === 'orders' ? 'text-secondarycolor' : 'text-primarycolor'}`}>Orders</p>
          </div>
        </Link>
      </nav>

      {isModalOpen && <SearchModal closeModal={closeModal} />}
    </>
  );
}
