"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-20 text-primarycolor"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>
      )}
      <div
        className={`fixed top-0 left-0 w-64 h-screen bg-primarycolor text-white transform transition-transform duration-300 ease-in-out ${
          isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
      >
        <h2 className="text-2xl font-bold p-4">Admin Dashboard</h2>
        <ul className="space-y-2">
          <li className="p-4">
            <Link href="/admin/products">Products</Link>
          </li>
          <li className="p-4">
            <Link href="/admin/categories">Categories</Link>
          </li>
          <li className="p-4">
            <Link href="/admin/orders">Orders</Link>
          </li>
          <li className="p-4">
            <Link href="/admin/reports">Sales Reports</Link>
          </li>
        </ul>
      </div>
    </>
  );
}
