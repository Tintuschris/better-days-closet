"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/sidebar';
import Navbar from './components/navbar';
import { Toaster } from 'sonner';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Prefetch admin pages for faster navigation
  useEffect(() => {
    const adminPages = [
      '/admin/products',
      '/admin/categories',
      '/admin/orders',
      '/admin/customers',
      '/admin/delivery-addresses',
      '/admin/banners',
      '/admin/reports',
      '/admin/settings'
    ];

    // Prefetch pages after a short delay to avoid blocking initial load
    const timer = setTimeout(() => {
      adminPages.forEach(page => {
        router.prefetch(page);
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--primarycolor)',
              color: 'white',
              borderRadius: '12px',
            },
          }}
        />
      </div>
    </div>
  );
}
