// app/client-layout-wrapper.js
'use client';

import { usePathname } from 'next/navigation';
import Header from './components/header';
import Footer from './components/footer';
import FloatingNavBar from './components/floatingnavbar';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { SupabaseProvider } from './context/supabaseContext';
import { CartProvider } from './context/cartContext';
import { WishlistProvider } from './context/wishlistContext';


export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/auth');
  const isProfile = pathname.startsWith('/profile');
  const [queryClient] = useState(() => new QueryClient());
  const [activeIcon, setActiveIcon] = useState('home');
  const [showNavBar, setShowNavBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setShowNavBar(false);
      } else {
        setShowNavBar(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle the scroll event to prevent excessive updates
    let timeoutId;
    const throttledHandleScroll = () => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = null;
        }, 100);
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array since we're using closure to access lastScrollY
  
  const content = isAdminRoute || isAuthRoute ||  isProfile? (
    <>
      {children}
      <Toaster 
        theme="light"
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--primarycolor)',
            color: 'white',
            borderRadius: '24px',
          },
        }}
      />
    </>
  ) : (
    <>
      <Header activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
      <main className="min-h-screen">{children}</main>
      <FloatingNavBar
        activeIcon={activeIcon}
        setActiveIcon={setActiveIcon}
        isVisible={showNavBar}
      />
      <Footer />
      <Toaster 
        theme="light"
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--primarycolor)',
            color: 'white',
            borderRadius: '24px',
          },
        }}
      />
    </>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <CartProvider>
        <WishlistProvider>
          {content}
          </WishlistProvider>
        </CartProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}