"use client";
import { Suspense } from 'react';
import CategoryAttributesForm from '../components/categoryattributesform';

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 bg-primarycolor/20 rounded w-48 animate-pulse" />
      <div className="h-48 bg-primarycolor/10 rounded animate-pulse" />
      <div className="h-64 bg-primarycolor/10 rounded animate-pulse" />
    </div>
  );
}

function CategoryAttributesContent() {
  return (
    <div className="p-6 bg-secondarycolor/5 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primarycolor">Category Attributes</h1>
        <p className="text-primarycolor/70 mt-2">
          Configure which categories support sizes and colors, and manage available options.
        </p>
      </div>
      
      <CategoryAttributesForm />
    </div>
  );
}

export default function CategoryAttributesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CategoryAttributesContent />
    </Suspense>
  );
}
