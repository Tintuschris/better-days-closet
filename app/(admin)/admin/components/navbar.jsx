"use client";
import { useAuth } from '../../../hooks/useAuth';
import { FiBell, FiUser, FiLogOut, FiMenu, FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { GradientText } from '../../../components/ui';

export default function Navbar({ onMenuClick }) {
  const { signOut, userDetails } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();

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
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-primarycolor hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 rounded-lg transition-all duration-300"
              title="Search"
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

        {/* Search Bar (expandable) */}
        {showSearch && (
          <div className="mt-3 pt-3 border-t border-primarycolor/10">
            <div className="relative max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primarycolor/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className="w-full pl-10 pr-4 py-2 bg-white/60 border border-primarycolor/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarycolor/20 focus:border-primarycolor text-primarycolor placeholder-primarycolor/60"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
