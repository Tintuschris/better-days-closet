"use client"
import { useState, useEffect, Suspense } from 'react';
import { useSupabaseContext } from '../context/supabaseContext';
import { ChevronLeft, MapPin, Heart, Package, Settings, LogOut, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import DeliveryAddress from './components/deliveryaddress';
import Wishlist from './components/wishlist';
import Orders from './components/orders';
import { useRouter, useSearchParams } from 'next/navigation';
import AccountSettings from './components/accountsettings';

function ProfilePageContent() {
  const { user, signOut, userDetails, fetchUserDetails } = useSupabaseContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || null;

  useEffect(() => {
    if (user?.id && fetchUserDetails) {
      fetchUserDetails(user.id);
    }
  }, [user, fetchUserDetails]);

  useEffect(() => {
    if (!user || !userDetails) {
      router.push('/auth/login');
    }
  }, [user, userDetails, router]);

  if (!user || !userDetails) {
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
          <div className="absolute bottom-0 left-0 right-0 h-[80%] bg-secondarycolor rounded-t-[2rem] z-0"></div>

          <div className="relative z-10">
            <div className="p-3">
              <button onClick={() => router.back()}>
                <ChevronLeft className="text-purple-900 w-5 h-5" />
              </button>
              <h1 className="text-center text-xl font-semibold text-primarycolor mt-2">PROFILE</h1>
            </div>

            <div className="flex flex-col items-center mt-3 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                <User className="w-full h-full object-cover bg-primarycolor text-white"/>
              </div>
              
              <h2 className="text-lg font-bold text-center text-primarycolor">
                {userDetails.name.split(' ').slice(0, 1).join(' ')}
                <br />
                {userDetails.name.split(' ').slice(1).join(' ')}
              </h2>
              <p className="text-base text-primarycolor mt-1">{userDetails.email}</p>
            </div>

            <div className="px-4 space-y-3">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(item.id)}
                  className="w-full bg-purple-900 text-white p-3 rounded-xl flex items-center justify-between hover:bg-primarycolor transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-base">{item.label}</span>
                  </div>
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </button>
              ))}

              <button
                onClick={handleSignOut}
                className="w-full bg-purple-900 text-white p-3 rounded-xl flex items-center justify-between hover:bg-primarycolor transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span className="text-base text-red-500">Sign out</span>
                </div>
                <ChevronLeft className="w-5 h-5 rotate-180" />
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
            return Component ? <Component /> : null;
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}