// app/client-layout-wrapper.js
'use client';

import { usePathname } from 'next/navigation';
import Header from './components/header';
import Footer from './components/footer';
import FloatingNavBar from './components/floatingnavbar';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { SupabaseProvider } from './context/supabaseContext';
import { CartProvider } from './context/cartContext';
import { WishlistProvider } from './context/wishlistContext';

// Create a client with custom configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
      retry: 1,
    },
  },
});

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/auth');
  const isProfile = pathname.startsWith('/profile');
  const isCart = pathname.startsWith('/cart');
  const isCheckout = pathname.startsWith('/checkout');
  const [activeIcon, setActiveIcon] = useState('home');
  const [showNavBar, setShowNavBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Set active icon based on current pathname
  useEffect(() => {
    if (pathname === '/') {
      setActiveIcon('home');
    } else if (pathname === '/wishlist') {
      setActiveIcon('wishlist');
    } else if (pathname === '/track-order') {
      setActiveIcon('orders');
    } else if (pathname.startsWith('/profile')) {
      setActiveIcon('profile');
    } else {
      setActiveIcon('home'); // Default fallback
    }
  }, [pathname]);

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
  }, [lastScrollY]);
  
  const content = isAdminRoute || isAuthRoute || isProfile || isCart || isCheckout ? (
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
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}
