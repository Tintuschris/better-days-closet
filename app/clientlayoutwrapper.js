// app/client-layout-wrapper.js
'use client';

import { usePathname } from 'next/navigation';
import Header from './components/header';
import Footer from './components/footer';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/auth');
  const [queryClient] = useState(() => new QueryClient());

  // Show only children for admin and auth routes
  if (isAdminRoute || isAuthRoute) {
    return (
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    );
  }

  // Show full layout for all other routes
  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main className="min-h-screen">{children}</main>
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
    </QueryClientProvider>
  );
}