// app/layout.js (Root Layout - Server Component)
import { Montserrat } from 'next/font/google';
import './globals.css';
import ClientLayoutWrapper from './clientlayoutwrapper';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],  // Add multiple weights if needed
  variable: '--font-montserrat',
});

export const metadata = {
  title: "Better Days Closet",
  description: "Ecommerce for The Better Days Closet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-montserrat`}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}