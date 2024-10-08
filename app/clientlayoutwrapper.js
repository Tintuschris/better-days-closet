// app/client-layout-wrapper.js (Client-Side Component)
'use client'; // This marks the file as a client component

import { usePathname } from 'next/navigation';
import LayoutWrapper from './layoutwrapper'; // Client-side layout wrapper
import Footer from './components/Footer';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname(); // Get the current route
  const isAdminRoute = pathname.startsWith('/admin'); // Check if it's an admin route

  return (
    <>
      {/* Conditionally render layout */}
      {!isAdminRoute ? (
        <>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Footer />
        </>
      ) : (
        <>{children}</> // Just render the children for admin routes without LayoutWrapper and Footer
      )}
    </>
  );
}
