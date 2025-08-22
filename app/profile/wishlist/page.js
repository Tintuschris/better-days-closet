"use client";
import { Suspense } from 'react';
import Wishlist from '../components/wishlist';

function WishlistPageContent() {
  return <Wishlist />;
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<div>Loading wishlist...</div>}>
      <WishlistPageContent />
    </Suspense>
  );
}
