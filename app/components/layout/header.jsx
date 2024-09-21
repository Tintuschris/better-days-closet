// components/layout/Header.tsx
import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-white">
      <div className="text-xl font-bold">Better Days Closet</div>
      <div className="flex items-center space-x-4">
        <Link href="/search">
          <Search className="w-6 h-6" />
        </Link>
        <Link href="/cart">
          <ShoppingCart className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
}