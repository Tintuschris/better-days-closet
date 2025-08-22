"use client";
import { Suspense } from 'react';
import DeliveryAddress from '../components/deliveryaddress';

function AddressesPageContent() {
  return <DeliveryAddress />;
}

export default function AddressesPage() {
  return (
    <Suspense fallback={<div>Loading addresses...</div>}>
      <AddressesPageContent />
    </Suspense>
  );
}
