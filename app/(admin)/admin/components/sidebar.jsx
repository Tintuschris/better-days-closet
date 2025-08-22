"use client"
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  FiHome, FiBox, FiShoppingBag, FiList,
  FiBarChart2, FiTruck, FiMenu, FiX, FiImage, FiSettings,
  FiUsers, FiHelpCircle, FiBell
} from 'react-icons/fi';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '../hooks/useSupabase';

const menuItems = [
  { path: '/admin', icon: FiHome, label: 'Dashboard', prefetchKeys: ['dashboardStats'] },
  { path: '/admin/products', icon: FiBox, label: 'Products', prefetchKeys: ['products', 'categories'] },
  { path: '/admin/categories', icon: FiList, label: 'Categories', prefetchKeys: ['categories'] },
  { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders', prefetchKeys: ['orders'], badge: null },
  { path: '/admin/customers', icon: FiUsers, label: 'Customers', prefetchKeys: ['customers'] },
  { path: '/admin/delivery-addresses', icon: FiTruck, label: 'Delivery', prefetchKeys: ['deliveryAddresses'] },
  { path: '/admin/banners', icon: FiImage, label: 'Marketing', prefetchKeys: ['banners'] },
  { path: '/admin/reports', icon: FiBarChart2, label: 'Reports', prefetchKeys: ['salesData'] },
  { path: '/admin/settings', icon: FiSettings, label: 'Settings', prefetchKeys: [] },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const [isMobile, setIsMobile] = useState(false);
  const [unreadOrders, setUnreadOrders] = useState(0);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const {
    fetchProducts,
    fetchCategories,
    fetchOrders,
    fetchSalesData,
    fetchBanners,
    fetchDeliveryAddresses,
    useOrders
  } = useSupabase();

  const { data: orders } = useOrders();

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (pathname === '/admin/orders') {
      setUnreadOrders(0);
    }
  }, [pathname]);

  useEffect(() => {
    // Calculate unread orders (pending orders)
    const pendingOrders = orders?.filter(order =>
      order.status?.toLowerCase() === 'pending'
    ).length || 0;
    setUnreadOrders(pendingOrders);
  }, [orders]);

  const handleLinkClick = useCallback(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, setIsOpen]);

  const prefetchData = (prefetchKeys) => {
    prefetchKeys.forEach(key => {
      switch(key) {
        case 'products':
          queryClient.prefetchQuery({
            queryKey: ['admin-products'],
            queryFn: fetchProducts
          });
          break;
        case 'categories':
          queryClient.prefetchQuery({
            queryKey: ['admin-categories'],
            queryFn: fetchCategories
          });
          break;
        case 'orders':
          queryClient.prefetchQuery({
            queryKey: ['admin-orders'],
            queryFn: fetchOrders
          });
          break;
        case 'salesData':
          queryClient.prefetchQuery({
            queryKey: ['admin-sales-data'],
            queryFn: fetchSalesData
          });
          break;
        case 'banners':
          queryClient.prefetchQuery({
            queryKey: ['admin-banners'],
            queryFn: fetchBanners
          });
          break;
        case 'deliveryAddresses':
          queryClient.prefetchQuery({
            queryKey: ['admin-delivery-addresses'],
            queryFn: fetchDeliveryAddresses
          });
          break;
        default:
          break;
      }
    });
  };

  // Update menu items with dynamic badge for orders
  const menuItemsWithBadges = menuItems.map(item => {
    if (item.path === '/admin/orders') {
      return { ...item, badge: unreadOrders > 0 ? unreadOrders : null };
    }
    return item;
  });

  return (
    <>
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-30 flex flex-col
          transform transition-transform duration-300 ease-in-out shadow-sm
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          w-60
        `}
      >
        {/* Logo Section */}
        <div className="p-4 flex-shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primarycolor to-primarycolor/80 rounded-lg flex items-center justify-center shadow-lg shadow-primarycolor/30">
              <span className="text-white font-bold text-sm">BC</span>
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-base font-bold text-primarycolor tracking-tight">Better Days</h1>
              <p className="text-xs text-secondarycolor font-semibold tracking-wide">CLOSET</p>
            </div>
          </div>
          <p className="text-xs text-primarycolor/60 ml-10">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          {menuItemsWithBadges.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={handleLinkClick}
                prefetch={true}
                className={`flex items-center gap-2.5 px-3 py-2 mb-0.5 rounded-md transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-primarycolor text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onMouseEnter={() => prefetchData(item.prefetchKeys)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Help Section */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Need help?</p>
            <Link href="/admin/help" className="text-primarycolor text-xs font-semibold hover:text-primarycolor/80 transition-colors">
              View Documentation
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={handleLinkClick}
        />
      )}
    </>
  );
}
