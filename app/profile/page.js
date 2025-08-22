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
import { Button, GlassContainer, PremiumCard, GradientText } from '../components/ui';
import { createClient } from '../lib/supabase';

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

  // Debug feature flag (removed auto-redirect to prevent infinite loop)
  useEffect(() => {
    const useNewPages = process.env.NEXT_PUBLIC_USE_NEW_PROFILE_PAGES === 'true';
    console.log('Profile page - using new pages:', useNewPages);
  }, []);

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
    // Feature flag to gradually migrate to new pages
    const useNewPages = process.env.NEXT_PUBLIC_USE_NEW_PROFILE_PAGES === 'true';
    
    if (useNewPages) {
      // Route to new individual pages
      const pageRoutes = {
        'delivery': '/profile/addresses',
        'wishlist': '/profile/wishlist', 
        'orders': '/profile/orders',
        'account': '/profile/settings'
      };
      
      router.push(pageRoutes[tabId] || `/profile?tab=${tabId}`);
    } else {
      // Keep existing tab behavior
      router.push(`/profile?tab=${tabId}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const isActiveTab = activeTab !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
      {/* Mobile Layout - Premium upgrade */}
      <div className="md:hidden">
        <AnimatePresence mode="wait">
          {!isActiveTab ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="min-h-screen relative"
            >
              {/* Premium Header with glass morphism */}
              <div className="sticky top-0 backdrop-blur-xl bg-white/80 border-b border-white/20 z-10 shadow-lg shadow-primarycolor/5">
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => router.back()}
                    className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 transition-all duration-300 backdrop-blur-sm"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <GradientText className="text-lg font-semibold">
                    My Profile
                  </GradientText>
                  
                  {/* Beta: Link to new dashboard */}
                  {process.env.NEXT_PUBLIC_USE_NEW_PROFILE_PAGES === 'true' && (
                    <button
                      onClick={() => router.push('/profile/dashboard')}
                      className="absolute top-2 right-12 text-xs bg-secondarycolor/20 text-primarycolor px-2 py-1 rounded-full hover:bg-secondarycolor/30 transition-colors"
                    >
                      New
                    </button>
                  )}

                  <div className="w-10 h-10"></div> {/* Spacer for center alignment */}
                </div>
              </div>

              {/* Premium Profile Card */}
              <div className="p-4">
                <PremiumCard className="p-6 mb-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primarycolor to-primarycolor/80 flex items-center justify-center mb-4 shadow-lg shadow-primarycolor/30">
                      <User className="w-10 h-10 text-white"/>
                    </div>

                    <GradientText className="text-xl font-bold mb-2">
                      {userDetails.name}
                    </GradientText>
                    <p className="text-primarycolor/70 text-sm">{userDetails.email}</p>
                  </div>
                </PremiumCard>

                {/* Premium Navigation Cards */}
                <div className="space-y-3">
                  {navigationItems.map((item, index) => (
                    <GlassContainer
                      key={index}
                      className="p-4 cursor-pointer hover:shadow-xl hover:shadow-primarycolor/20 transition-all duration-300 transform hover:scale-[1.02]"
                      onClick={() => setActiveTab(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primarycolor/20 to-secondarycolor/20 flex items-center justify-center border border-primarycolor/30">
                            <div className="text-primarycolor">
                              {item.icon}
                            </div>
                          </div>
                          <span className="font-medium text-primarycolor">{item.label}</span>
                        </div>
                        <ChevronLeft className="w-5 h-5 rotate-180 text-primarycolor/60" />
                      </div>
                    </GlassContainer>
                  ))}

                  {/* Sign Out Button */}
                  <GlassContainer
                    className="p-4 cursor-pointer hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 transform hover:scale-[1.02] border-red-200/50"
                    onClick={handleSignOut}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                          <LogOut className="w-5 h-5 text-red-500" />
                        </div>
                        <span className="font-medium text-red-500">Sign out</span>
                      </div>
                      <ChevronLeft className="w-5 h-5 rotate-180 text-red-400" />
                    </div>
                  </GlassContainer>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-screen"
            >
              {(() => {
                const Component = navigationItems.find(item => item.id === activeTab)?.component;
                return Component ? <Component /> : null;
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Layout - Premium upgrade */}
      <div className="hidden md:block max-w-7xl mx-auto py-8 px-4">
        <div className="flex gap-8">
          {/* Left Sidebar - Premium styling */}
          <div className="w-80 flex-shrink-0">
            <PremiumCard className="overflow-hidden">
              {/* Premium Profile Header */}
              <div className="bg-gradient-to-br from-primarycolor via-primarycolor/90 to-purple-700 p-6 text-center relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    <defs>
                      <pattern id="grid-profile" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid-profile)" />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-white"/>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{userDetails.name}</h2>
                  <p className="text-white/80 text-sm">{userDetails.email}</p>
                </div>
              </div>

              {/* Premium Navigation Menu */}
              <div className="p-4 space-y-2">
                {navigationItems.map((item, index) => (
                  <Button
                    key={index}
                    onClick={() => setActiveTab(item.id)}
                    variant={activeTab === item.id ? "primary" : "ghost"}
                    size="md"
                    radius="lg"
                    fullWidth
                    className="justify-between h-12"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${activeTab === item.id ? 'text-white' : 'text-primarycolor'}`}>
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronLeft className={`w-5 h-5 rotate-180 ${activeTab === item.id ? 'text-white' : 'text-primarycolor/60'}`} />
                  </Button>
                ))}

                <div className="h-px bg-gray-200 my-2"></div>

                {/* Premium Sign Out Button */}
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="md"
                  radius="lg"
                  fullWidth
                  className="justify-between h-12 text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200/50"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign out</span>
                  </div>
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </Button>
              </div>
            </PremiumCard>
          </div>

          {/* Right Content Area - Premium styling */}
          <div className="flex-1">
            <PremiumCard className="p-6 min-h-[600px]">
              {!isActiveTab ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 flex items-center justify-center mb-6">
                    <User className="w-10 h-10 text-primarycolor" />
                  </div>
                  <GradientText className="text-2xl font-bold mb-4">
                    Welcome to Your Profile
                  </GradientText>
                  <p className="text-primarycolor/70 mb-6 max-w-md leading-relaxed">
                    Select an option from the menu to manage your account, view orders, update delivery information, or browse your wishlist.
                  </p>

                  {/* Quick action cards */}
                  <div className="grid grid-cols-2 gap-4 max-w-md w-full">
                    {navigationItems.slice(0, 4).map((item, index) => (
                      <GlassContainer
                        key={index}
                        className="p-4 cursor-pointer hover:shadow-lg hover:shadow-primarycolor/20 transition-all duration-300 transform hover:scale-105"
                        onClick={() => setActiveTab(item.id)}
                      >
                        <div className="text-center">
                          <div className="w-8 h-8 mx-auto mb-2 text-primarycolor">
                            {item.icon}
                          </div>
                          <span className="text-xs font-medium text-primarycolor">{item.label}</span>
                        </div>
                      </GlassContainer>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  {(() => {
                    const Component = navigationItems.find(item => item.id === activeTab)?.component;
                    return Component ? <Component /> : null;
                  })()}
                </div>
              )}
            </PremiumCard>
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
