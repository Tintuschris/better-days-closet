// app/client-layout-wrapper.js
'use client';

import { usePathname } from 'next/navigation';
import LayoutWrapper from './layoutwrapper';
import Footer from './components/footer';
import Header from './components/header'; 

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const isCategoryPage = pathname.startsWith('/categories/');

  if (isHomepage) {
    return (
      <>
        <LayoutWrapper>{children}</LayoutWrapper>
        <Footer />
      </>
    );
  }

  if (isCategoryPage) {
    return (
      <>
        <Header />
        {children}
        <Footer />
      </>
    );
  }

  // For all other routes, just render the children
  return <>{children}</>;
}