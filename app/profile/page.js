"use client"
import { useState, useEffect } from 'react';
import { useSupabaseContext } from '../context/supabaseContext';
import { ChevronLeft, MapPin, Heart, Package, Settings, LogOut, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DeliveryAddress from './components/deliveryaddress';
import Wishlist from './components/wishlist';
import Orders from './components/orders';
import { useRouter, useSearchParams } from 'next/navigation';
import AccountSettings from './components/accountsettings';

export default function ProfilePage() {
  const { user, signOut, userDetails, fetchUserDetails } = useSupabaseContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || null;

  useEffect(() => {
    if (user && fetchUserDetails) {
      fetchUserDetails();
    }
  }, [user, fetchUserDetails]);

  if (!user || !userDetails) {
    router.push('/auth/login');
    return null;
  }

  const navigationItems = [
    {
      icon: <MapPin className="w-6 h-6" />,
      label: "Delivery Address",
      id: "delivery",
      component: DeliveryAddress
    },
    {
      icon: <Heart className="w-6 h-6" />,
      label: "My Wishlist",
      id: "wishlist",
      component: Wishlist
    },
    {
      icon: <Package className="w-6 h-6" />,
      label: "My Orders",
      id: "orders",
      component: Orders
    },
    {
      icon: <Settings className="w-6 h-6" />,
      label: "Account Settings",
      id: "account",
      component: AccountSettings
    }
  ];

  const setActiveTab = (tabId) => {
    router.push(`/profile?tab=${tabId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const isActiveTab = activeTab !== null;

  return (
    <AnimatePresence mode="wait">
      {!isActiveTab ? (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="min-h-screen bg-white relative"
        >
          {/* Background rectangle */}
          <div className="absolute bottom-0 left-0 right-0 h-[80%] bg-secondarycolor rounded-t-[4rem] z-0"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="p-6">
              <button onClick={() => router.back()}>
                <ChevronLeft className="text-purple-900 w-6 h-6" />
              </button>
              <h1 className="text-center text-2xl font-semibold text-primarycolor mt-2">PROFILE</h1>
            </div>

            {/* Profile Picture and Name */}
            <div className="flex flex-col items-center mt-4 mb-8">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-6">
                <User className="w-full h-full object-cover bg-primarycolor"/>
              </div>
              
              <h2 className="text-2xl font-bold text-center text-primarycolor">
                {userDetails.name.split(' ').slice(0, 1).join(' ')}
                <br />
                {userDetails.name.split(' ').slice(1).join(' ')}
              </h2>
              <p className="text-xl text-primarycolor mt-2">{userDetails.email}</p>
            </div>

            {/* Navigation Items */}
            <div className="px-6 space-y-4">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(item.id)}
                  className="w-full bg-purple-900 text-white p-4 rounded-xl flex items-center justify-between hover:bg-primarycolor transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {item.icon}
                    <span className="text-xl">{item.label}</span>
                  </div>
                  <ChevronLeft className="w-6 h-6 rotate-180" />
                </button>
              ))}

              <button
                onClick={handleSignOut}
                className="w-full bg-purple-900 text-white p-4 rounded-xl flex items-center justify-between hover:bg-primarycolor transition-colors"
              >
                <div className="flex items-center gap-4">
                  <LogOut className="w-6 h-6 text-red-500" />
                  <span className="text-xl text-red-500">Sign out</span>
                </div>
                <ChevronLeft className="w-6 h-6 rotate-180" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="min-h-screen bg-white"
        >
          {(() => {
            const Component = navigationItems.find(item => item.id === activeTab)?.component;
            return Component ? (
              <div>
                {/* <div className="flex items-center p-4">
                  <button onClick={() => router.push('/profile')} className="mr-4">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-xl font-semibold">{navigationItems.find(item => item.id === activeTab)?.label}</h2>
                </div> */}
                <Component />
              </div>
            ) : null;
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}