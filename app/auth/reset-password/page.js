"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import { ChevronLeft, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // Simple initialization - assume callback validated everything
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    setSupabaseClient(supabase);

    // Get URL parameters from callback
    const url = new URL(window.location.href);
    const sessionReady = url.searchParams.get('session_ready');
    const userEmailParam = url.searchParams.get('user_email');

    console.log('Reset password page - session_ready:', sessionReady, 'user_email:', userEmailParam);

    if (sessionReady === 'true' && userEmailParam) {
      // Callback validated everything - show form immediately
      setUserEmail(decodeURIComponent(userEmailParam));
      console.log('Session pre-validated by callback for user:', userEmailParam);
    } else {
      // Direct access without proper callback validation
      console.log('Invalid access - redirecting to forgot password');
      setError('Please use the password reset link from your email to access this page.');
    }
  }, []);
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Attempting to reset password...');

      if (!supabaseClient) {
        setError('Supabase client not initialized. Please refresh the page and try again.');
        setIsSubmitting(false);
        return;
      }

      // Check if we have a valid session before attempting password reset
      const { data: { session } } = await supabaseClient.auth.getSession();
      console.log('Current session before password reset:', session?.user?.email);

      if (!session?.user) {
        setError('No active session found. Please try the password reset process again.');
        setIsSubmitting(false);
        return;
      }

      // Use the same Supabase client instance to update password
      const { data, error } = await supabaseClient.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      console.log('Password reset successful:', data?.user?.email);

      setMessage('Password reset successfully. Redirecting you to login...');
      // Start countdown redirect so user can read success state
      let remaining = 5;
      const interval = setInterval(() => {
        remaining -= 1;
        setRedirectCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          window.location.href = '/auth/login';
        }
      }, 1000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(`Failed to reset password: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Enhanced brand imagery */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primarycolor via-purple-700 to-purple-900 justify-center items-center p-12 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <defs>
              <pattern id="grid-reset" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid-reset)" />
          </svg>
        </div>
        
        <div className="max-w-md text-white text-center relative z-10">
          <div className="mb-8 relative">
            <div className="w-32 h-28 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm p-4">
              <Image 
                src="/Desktop-Logo.svg" 
                alt="Better Days Closet" 
                width={120} 
                height={50}
                className="transition-transform duration-200 hover:scale-105" 
                priority
              />
            </div>
          </div>
          <div className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Lock className="w-8 h-8 opacity-80" />
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">Set New Password</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Choose a strong password to keep your account secure and protected.
          </p>
          
          {/* Floating elements for visual interest */}
          <div className="absolute top-20 left-10 w-3 h-3 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-8 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
        </div>
      </div>
      
      {/* Right side - Enhanced auth form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12 min-h-screen">
        <div className="w-full max-w-md">
          {/* Enhanced back button */}
          <Link href="/auth/login" className="inline-flex items-center text-primarycolor mb-10 hover:text-primarycolor/80 transition-all duration-200 group">
            <div className="p-2 rounded-lg group-hover:bg-gray-50 transition-colors duration-200">
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Back to Login</span>
            </div>
          </Link>
          
          {/* Mobile logo with enhanced styling */}
          <div className="md:hidden text-center mb-10">
            <div className="w-24 h-20 mx-auto mb-4 bg-gradient-to-br from-primarycolor/5 to-secondarycolor/5 rounded-2xl flex items-center justify-center p-3">
              <Image 
                src="/Mobile-Logo.svg" 
                alt="Better Days Closet" 
                width={90} 
                height={75}
                className="transition-transform duration-200 hover:scale-105" 
                priority
              />
            </div>
          </div>
          
          {/* Enhanced title section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-primarycolor mb-4 tracking-tight">
              Reset Password
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primarycolor to-secondarycolor rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {userEmail ? `Reset password for ${userEmail}` : 'Enter your new password below'}
            </p>
          </div>

          {/* Enhanced Status Messages */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-red-600 text-sm">!</span>
                  </div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
                <a
                  href="/auth/forgot-password"
                  className="ml-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </a>
              </div>
            </div>
          )}
          
      {message && (
            <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-xl">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Lock className="w-4 h-4 text-green-600" />
                </div>
        <p className="text-green-700 text-sm font-medium">{message} {message && redirectCountdown < 5 && redirectCountdown > 0 && `( ${redirectCountdown}s )`}</p>
              </div>
            </div>
          )}

          {/* Password Reset Form - Show instantly when user email is present */}
          {userEmail && !error && (
            <form onSubmit={handleResetPassword} className="space-y-8">
            <div className="space-y-6">
              <div className="group">
                <label htmlFor="newPassword" className="block text-gray-700 mb-3 font-medium text-sm tracking-wide">
                  NEW PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    className="w-full p-4 pr-12 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-primarycolor focus:bg-white focus:ring-4 focus:ring-primarycolor/10 outline-none text-primarycolor transition-all duration-200 group-hover:border-gray-300"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primarycolor transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <div className="absolute inset-y-0 right-12 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-2 h-2 bg-primarycolor/20 rounded-full"></div>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className={`h-1 flex-1 rounded ${newPassword.length >= 6 ? 'bg-green-400' : 'bg-gray-200'} transition-colors duration-200`}></div>
                  <div className={`h-1 flex-1 rounded ${newPassword.length >= 8 ? 'bg-green-400' : 'bg-gray-200'} transition-colors duration-200`}></div>
                  <div className={`h-1 flex-1 rounded ${newPassword.length >= 10 ? 'bg-green-400' : 'bg-gray-200'} transition-colors duration-200`}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Password must be at least 6 characters</p>
              </div>
              
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-3 font-medium text-sm tracking-wide">
                  CONFIRM NEW PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full p-4 pr-12 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-primarycolor focus:bg-white focus:ring-4 focus:ring-primarycolor/10 outline-none text-primarycolor transition-all duration-200 group-hover:border-gray-300"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primarycolor transition-colors duration-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <div className="absolute inset-y-0 right-12 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-2 h-2 bg-primarycolor/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primarycolor to-secondarycolor text-white py-4 px-8 rounded-2xl font-semibold text-lg tracking-wide hover:shadow-2xl hover:shadow-primarycolor/25 transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primarycolor/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-3" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock size={20} className="mr-3" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
          )}

          {/* Back to Login - Show when form is visible */}
          {userEmail && !error && (
            <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <span>Remember your password?</span>
              <Link href="/auth/login" className="text-primarycolor font-semibold hover:text-primarycolor/80 transition-colors duration-200 relative group">
                Back to Login
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primarycolor group-hover:w-full transition-all duration-200"></span>
              </Link>
            </div>
          </div>
          )}
          
          {/* Enhanced decorative element */}
          <div className="mt-16 opacity-5">
            <svg className="w-full h-20" viewBox="0 0 400 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="url(#gradient-reset)" d="M0,30 Q100,10 200,30 T400,30 L400,80 L0,80 Z" />
              <defs>
                <linearGradient id="gradient-reset" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#460066" />
                  <stop offset="100%" stopColor="#FC9AE7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
