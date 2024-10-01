import { Montserrat } from 'next/font/google';
import './globals.css';
import LayoutWrapper from './layoutwrapper'; // Import the client wrapper
import Footer from './components/Footer';

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
      <body className={`${montserrat.variable} font-sans`}>
        <LayoutWrapper>
          {children}  {/* This will be passed inside the client-side LayoutWrapper */}
        </LayoutWrapper>
        <Footer />
      </body>
    </html>
  );
}
