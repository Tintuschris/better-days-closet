"use client";
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <NotFoundContent />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4 text-center">
        <div className="h-12 w-48 bg-gray-200 rounded mx-auto" />
        <div className="h-6 w-64 bg-gray-200 rounded mx-auto" />
      </div>
    </div>
  );
}

function NotFoundContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-primarycolor mb-4">404</h1>
      <p className="text-lg text-primarycolor mb-8">Page not found</p>
      <Link 
        href="/" 
        className="flex items-center gap-2 bg-primarycolor text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
      >
        <Home size={20} />
        Back to Home
      </Link>
    </div>
  );
}
