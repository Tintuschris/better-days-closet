"use client";
import { useAuth } from '../../../hooks/useAuth';
import { FiBell, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { signOut, userDetails } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Add notification state if needed
  // const { unreadCount } = useOrderNotifications();

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mr-3 p-1.5 md:hidden text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-base md:text-xl font-semibold text-primarycolor truncate">
              Better Days Closet
            </h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            {/* Notification Bell - visible on all screens */}
            <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full relative text-gray-700">
              <FiBell className="w-4 h-4 md:w-5 md:h-5" />
              {/* Add notification badge if needed */}
              {/* {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )} */}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primarycolor/10 rounded-full flex items-center justify-center text-primarycolor">
                <FiUser className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-800 truncate max-w-[80px] md:max-w-[120px]">
                {userDetails?.name || 'Admin'}
              </span>
            </div>
            
            <button 
              onClick={signOut}
              className="p-1.5 md:p-2 hover:bg-gray-100 text-gray-700 hover:text-red-600 rounded-full transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
