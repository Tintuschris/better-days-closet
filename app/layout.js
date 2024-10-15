// app/layout.js (Root Layout - Server Component)
import { Montserrat } from 'next/font/google';
import './globals.css';
import ClientLayoutWrapper from './clientlayoutwrapper'; // Import client-side layout handler

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-montserrat',
});

export const metadata = {
  title: "Better Days Closet",
  description: "Ecommerce for The Better Days Closet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.variable}>
        {/* Client-side logic to conditionally render layout based on route */}
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
