// app/client-layout-wrapper.js
'use client';

import { usePathname } from 'next/navigation';
import LayoutWrapper from './layoutwrapper';
import Footer from './components/footer';
import Header from './components/header'; 
import { Toaster } from 'sonner';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const isCategoryPage = pathname.startsWith('/categories/');

  return (
    <>
      {isHomepage ? (
        <>
          <LayoutWrapper>{children}</LayoutWrapper>
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
      ) : isCategoryPage ? (
        <>
          <Header />
          {children}
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
      ) : (
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
      )}
    </>
  );
}