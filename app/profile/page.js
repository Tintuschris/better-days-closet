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
    <div className="min-h-screen bg-white">
      {/* Mobile Layout - Keeping original styling */}
      <div className="md:hidden">
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
      </div>

      {/* Desktop Layout - New two-column design */}
      <div className="hidden md:block max-w-7xl mx-auto py-8 px-4">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-secondarycolor p-6 text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-primarycolor mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-white"/>
                </div>
                <h2 className="text-xl font-bold text-primarycolor">{userDetails.name}</h2>
                <p className="text-sm text-primarycolor mt-1">{userDetails.email}</p>
              </div>
              
              {/* Navigation Menu - Matching mobile styling */}
              <div className="p-4 space-y-2">
                {navigationItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-colors ${
                      activeTab === item.id 
                        ? "bg-primarycolor text-white" 
                        : "bg-purple-900 text-white hover:bg-primarycolor"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </button>
                ))}
                
                <div className="h-px bg-gray-200 my-2"></div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full p-3 rounded-xl bg-purple-900 text-white flex items-center justify-between hover:bg-primarycolor transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-500">Sign out</span>
                  </div>
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Content Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            {!isActiveTab ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <User className="w-16 h-16 text-primarycolor mb-4" />
                <h2 className="text-2xl font-bold text-primarycolor mb-2">Welcome to Your Profile</h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  Select an option from the menu to manage your account, view orders, update delivery information, or browse your wishlist.
                </p>
              </div>
            ) : (
              <div className="h-full">
                {(() => {
                  const Component = navigationItems.find(item => item.id === activeTab)?.component;
                  return Component ? <Component /> : null;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
