"use client";
import { ChevronLeft, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSupabaseContext } from '../../context/supabaseContext';
import { PremiumCard, GradientText } from '../../components/ui';

export default function ProfileLayout({ 
  title, 
  backUrl = '/profile', 
  showUserInfo = false,
  actions = null,
  children 
}) {
  const router = useRouter();
  const { userDetails } = useSupabaseContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-xl bg-white/80 border-b border-white/20 z-10 shadow-lg shadow-primarycolor/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <button
            onClick={() => router.push(backUrl)}
            className="text-primarycolor flex items-center justify-center w-10 h-10 rounded-full hover:bg-gradient-to-r hover:from-primarycolor/10 hover:to-secondarycolor/10 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>

          <GradientText className="text-lg font-semibold">
            {title}
          </GradientText>

          <div className="w-10 h-10 flex items-center justify-center">
            {actions}
          </div>
        </div>
      </div>

      {/* User Info Section (Optional) */}
      {showUserInfo && userDetails && (
        <div className="max-w-4xl mx-auto p-4">
          <PremiumCard className="p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primarycolor to-primarycolor/80 flex items-center justify-center shadow-lg shadow-primarycolor/30">
                <User className="w-8 h-8 text-white"/>
              </div>
              <div>
                <GradientText className="text-xl font-bold mb-1">
                  {userDetails.name}
                </GradientText>
                <p className="text-primarycolor/70 text-sm">{userDetails.email}</p>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 pb-20">
        <PremiumCard className="p-6 min-h-[400px]">
          {children}
        </PremiumCard>
      </div>

      {/* Breadcrumb for mobile */}
      <div className="md:hidden fixed bottom-20 left-4 right-4 flex justify-center z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-primarycolor/10">
          <div className="flex items-center space-x-2 text-sm text-primarycolor/70">
            <button 
              onClick={() => router.push('/profile')}
              className="hover:text-primarycolor transition-colors"
            >
              Profile
            </button>
            <span>•</span>
            <span className="text-primarycolor font-medium">{title}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
