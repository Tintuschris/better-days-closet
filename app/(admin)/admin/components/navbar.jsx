"use client";
import { useAuth } from '../../../hooks/useAuth';
import { FiBell, FiUser, FiLogOut, FiMenu, FiSearch } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { GradientText } from '../../../components/ui';
import AdminGlobalSearch from './AdminGlobalSearch';

export default function Navbar({ onMenuClick }) {
  const { signOut, userDetails } = useAuth();
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const pathname = usePathname();

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get page title from pathname
  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    if (pathname === '/admin') return 'Dashboard';
    if (lastSegment === 'products') return 'Products';
    if (lastSegment === 'categories') return 'Categories';
    if (lastSegment === 'orders') return 'Orders';
    if (lastSegment === 'customers') return 'Customers';
    if (lastSegment === 'delivery-addresses') return 'Delivery';
    if (lastSegment === 'banners') return 'Marketing';
    if (lastSegment === 'reports') return 'Reports';
    if (lastSegment === 'settings') return 'Settings';

    return 'Admin';
  };

  return (
    <nav className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-primarycolor/5">
      <div className="px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-primarycolor hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 rounded-lg transition-all duration-300"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <GradientText className="text-lg lg:text-xl font-bold">
                {getPageTitle()}
              </GradientText>
              <p className="text-xs text-primarycolor/60 hidden sm:block">
                Better Days Closet Admin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Global Search Button */}
            <button
              onClick={() => setShowGlobalSearch(true)}
              className="p-2 text-primarycolor hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 rounded-lg transition-all duration-300"
              title="Global Search (Ctrl+K)"
            >
              <FiSearch className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>

            {/* Notification Bell */}
            <button className="p-2 hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 rounded-lg relative text-primarycolor transition-all duration-300">
              <FiBell className="w-4 h-4 lg:w-5 lg:h-5" />
              {/* Notification badge placeholder */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-primarycolor/20">
              <div className="w-8 h-8 bg-gradient-to-br from-primarycolor to-primarycolor/80 rounded-full flex items-center justify-center text-white shadow-lg shadow-primarycolor/30">
                <FiUser className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-primarycolor truncate max-w-[100px] lg:max-w-[120px]">
                  {userDetails?.name || 'Admin'}
                </p>
                <p className="text-xs text-primarycolor/60">Administrator</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={signOut}
              className="p-2 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 text-primarycolor hover:text-red-600 rounded-lg transition-all duration-300"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Global Search Modal */}
      <AdminGlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
      />
    </nav>
  );
}
