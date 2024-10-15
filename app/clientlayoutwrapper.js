// app/client-layout-wrapper.js
'use client';

import { usePathname } from 'next/navigation';
import LayoutWrapper from './layoutwrapper';
import Footer from './components/Footer';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  if (isHomepage) {
    return (
      <>
        <LayoutWrapper>{children}</LayoutWrapper>
        <Footer />
      </>
    );
  }

  // For all other routes, just render the children without LayoutWrapper and Footer
  return <>{children}</>;
}