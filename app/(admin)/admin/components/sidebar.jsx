"use client"
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  FiHome, FiBox, FiShoppingBag, FiList,
  FiBarChart2, FiTruck, FiMenu, FiX, FiImage, FiSettings
} from 'react-icons/fi';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '../hooks/useSupabase';

const menuItems = [
  { path: '/admin', icon: FiHome, label: 'Dashboard', prefetchKeys: ['dashboardStats'] },
  { path: '/admin/products', icon: FiBox, label: 'Products', prefetchKeys: ['products', 'categories'] },
  { path: '/admin/categories', icon: FiList, label: 'Categories', prefetchKeys: ['categories'] },
  { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders', prefetchKeys: ['orders'] },
  { path: '/admin/reports', icon: FiBarChart2, label: 'Reports', prefetchKeys: ['salesData'] },
  { path: '/admin/delivery-addresses', icon: FiTruck, label: 'Delivery', prefetchKeys: ['deliveryAddresses'] },
  { path: '/admin/banners', icon: FiImage, label: 'Banners', prefetchKeys: ['banners'] },
  { path: '/admin#testing', icon: FiSettings, label: 'System Tests', prefetchKeys: [] },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { 
    fetchProducts, 
    fetchCategories, 
    fetchOrders, 
    fetchSalesData,
    fetchBanners,
    fetchDeliveryAddresses
  } = useSupabase();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const prefetchData = (prefetchKeys) => {
    prefetchKeys.forEach(key => {
      switch(key) {
        case 'products':
          queryClient.prefetchQuery(['products'], fetchProducts);
          break;
        case 'categories':
          queryClient.prefetchQuery(['categories'], fetchCategories);
          break;
        case 'orders':
          queryClient.prefetchQuery(['orders'], fetchOrders);
          break;
        case 'salesData':
          queryClient.prefetchQuery(['salesData'], fetchSalesData);
          break;
        case 'banners':
          queryClient.prefetchQuery(['banners'], fetchBanners);
          break;
        case 'deliveryAddresses':
          queryClient.prefetchQuery(['deliveryAddresses'], fetchDeliveryAddresses);
          break;
        default:
          break;
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed top-4 ${isOpen ? 'left-64' : 'left-4'} z-50 p-2 rounded-md bg-primarycolor text-white transition-all duration-300`}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <aside className={`
        fixed top-0 left-0 h-screen bg-primarycolor text-white w-64 
        transform transition-transform duration-300 ease-in-out z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative
      `}>
        <div className="p-6">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                prefetch={true}
                className={`
                  flex items-center px-6 py-3 text-sm
                  ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                  transition-colors duration-200
                `}
                onMouseEnter={() => prefetchData(item.prefetchKeys)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
