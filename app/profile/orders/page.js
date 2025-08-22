"use client";
import { Suspense } from 'react';
import Orders from '../components/orders';

function OrdersPageContent() {
  return <Orders />;
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div>Loading orders...</div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
