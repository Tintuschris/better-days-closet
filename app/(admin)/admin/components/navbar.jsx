"use client";
import { useAuth } from '../../../hooks/useAuth';
import { FiBell, FiUser, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const { signOut, userDetails } = useAuth();
  // Add notification state if needed
  // const { unreadCount } = useOrderNotifications();

  return (
    <nav className="sticky top-0 z-30 bg-white border-b shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-3 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base md:text-xl font-semibold text-primarycolor truncate">
            Better Days Closet
          </h1>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notification Bell - visible on all screens */}
            <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full relative">
              <FiBell className="w-4 h-4 md:w-5 md:h-5" />
              {/* Add notification badge if needed */}
              {/* {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )} */}
            </button>

            <span className="text-xs md:text-sm font-medium truncate max-w-[80px] md:max-w-none">
              {userDetails?.name || 'Admin'}
            </span>
            
            <button 
              onClick={signOut}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
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
