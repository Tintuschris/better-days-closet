"use client";
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

// Simply redirect to main profile page to avoid infinite loops
export default function ProfileDashboardPage() {
  redirect('/profile');
}
