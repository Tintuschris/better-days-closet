"use client"
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Orders from './components/orders';
import Wishlist from './components/wishlist';
import AccountSettings from './components/accountsettings';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('orders');  // Can be 'orders', 'wishlist', 'settings'

  if (!user) {
    return <p>Loading...</p>;
  }

  const renderContent = () => {
    switch (tab) {
      case 'orders':
        return <Orders />;
      case 'wishlist':
        return <Wishlist />;
      case 'settings':
        return <AccountSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">My Profile</h1>
      <div className="flex space-x-4">
        <button onClick={() => setTab('orders')} className={`py-2 px-4 rounded ${tab === 'orders' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Orders</button>
        <button onClick={() => setTab('wishlist')} className={`py-2 px-4 rounded ${tab === 'wishlist' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Wishlist</button>
        <button onClick={() => setTab('settings')} className={`py-2 px-4 rounded ${tab === 'settings' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Account Settings</button>
      </div>

      <div className="mt-4">
        {renderContent()}
      </div>

      <button onClick={signOut} className="mt-4 bg-red-500 text-white px-4 py-2">Sign Out</button>
    </div>
  );
}
