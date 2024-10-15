'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Home, Search, Heart, User } from 'lucide-react';
import SearchModal from '../(modals)/searchmodal'; // Adjust the import path
import { useAuth } from '../hooks/useAuth'; // Import useAuth hook

export default function FloatingNavBar({ activeIcon, setActiveIcon, isVisible }) {
  const { user } = useAuth(); // Access user state
  const [isModalOpen, setIsModalOpen] = useState(false); // Manage modal state

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <nav
        className={`fixed text-primarycolor bottom-0 left-0 w-full bg-white shadow-lg border-t p-4 flex justify-around z-10 transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
      >
        {/* Home Icon and Text */}
        <button onClick={() => setActiveIcon('home')} className="text-center">
          <Link href="/">
            <Home className={`h-6 w-6 mx-auto ${activeIcon === 'home' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
            <p className={`text-xs ${activeIcon === 'home' ? 'text-secondarycolor' : 'text-primarycolor'}`}>Home</p>
          </Link>
        </button>

        {/* Search Icon and Text */}
        <button onClick={openModal} className="text-center">
          <Search className={`h-6 w-6 mx-auto ${activeIcon === 'search' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
          <p className={`text-xs ${activeIcon === 'search' ? 'text-secondarycolor' : 'text-primarycolor'}`}>Search</p>
        </button>

        {/* Wishlist Icon and Text */}
        <button onClick={() => setActiveIcon('wishlist')} className="text-center">
          <Link href="/wishlist">
            <Heart className={`h-6 w-6 mx-auto ${activeIcon === 'wishlist' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
            <p className={`text-xs ${activeIcon === 'wishlist' ? 'text-secondarycolor' : 'text-primarycolor'}`}>Wishlist</p>
          </Link>
        </button>

        {/* Profile Icon and Text */}
        <button onClick={() => setActiveIcon('profile')} className="text-center">
          <Link href={user ? "/profile" : "/auth/login"}>
            <User className={`h-6 w-6 mx-auto ${activeIcon === 'profile' ? 'text-secondarycolor' : 'text-primarycolor'}`} />
            <p className={`text-xs ${activeIcon === 'profile' ? 'text-secondarycolor' : 'text-primarycolor'}`}>Profile</p>
          </Link>
        </button>
      </nav>

      {/* Render Search Modal when open */}
      {isModalOpen && <SearchModal closeModal={closeModal} />}
    </>
  );
}
