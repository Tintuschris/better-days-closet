"use client"
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import { ChevronLeft, Loader2, Mail } from 'lucide-react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for error messages from URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      const messageParam = urlParams.get('message');
      
      if (errorParam === 'link_expired') {
        setError('Your reset link has expired. Please request a new one below.');
      } else if (errorParam === 'link_used') {
        setError('This reset link has already been used. Please request a new one below.');
      } else if (messageParam) {
        const decodedMessage = decodeURIComponent(messageParam);
        if (decodedMessage.includes('expired') || decodedMessage.includes('invalid')) {
          setError('Your reset link is no longer valid. Please request a new one below.');
        } else {
          setError(decodedMessage);
        }
      }
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      await resetPasswordForEmail(email);
      // Neutral message to prevent email enumeration
      setMessage('If an account exists for that email, a reset link has been sent. Please check your inbox.');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
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
              <pattern id="grid-forgot" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid-forgot)" />
          </svg>
        </div>
        
        <div className="max-w-md text-white text-center relative z-10">
          <div className="mb-8 relative">
            <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Image 
                src="/logo.png" 
                alt="Better Days Closet" 
                width={60} 
                height={60}
                className="rounded-xl" 
                priority
              />
            </div>
          </div>
          <div className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Mail className="w-8 h-8 opacity-80" />
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">Password Reset</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Don't worry! Enter your email address and we'll send you a link to reset your password.
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
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primarycolor/5 to-secondarycolor/5 rounded-2xl flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="Better Days Closet" 
                width={48} 
                height={48}
                className="rounded-xl" 
                priority
              />
            </div>
          </div>
          
          {/* Enhanced title section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-primarycolor mb-4 tracking-tight">
              Forgot Password?
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primarycolor to-secondarycolor rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Enter your email to receive a password reset link
            </p>
          </div>
          
          {/* Enhanced Status Messages */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-600 text-sm">!</span>
                </div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
          
          {message && (
            <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-xl">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Mail className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-green-700 text-sm font-medium">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-8">
            <div className="group">
              <label htmlFor="email" className="block text-gray-700 mb-3 font-medium text-sm tracking-wide">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-primarycolor focus:bg-white focus:ring-4 focus:ring-primarycolor/10 outline-none text-primarycolor transition-all duration-200 group-hover:border-gray-300"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-2 h-2 bg-primarycolor/20 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primarycolor to-purple-700 text-white py-4 rounded-2xl font-semibold flex items-center justify-center hover:from-primarycolor/90 hover:to-purple-700/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-3" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail size={20} className="mr-3" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <span>Remember your password?</span>
              <Link href="/auth/login" className="text-primarycolor font-semibold hover:text-primarycolor/80 transition-colors duration-200 relative group">
                Back to Login
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primarycolor group-hover:w-full transition-all duration-200"></span>
              </Link>
            </div>
          </div>
          
          {/* Enhanced decorative element */}
          <div className="mt-16 opacity-5">
            <svg className="w-full h-20" viewBox="0 0 400 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="url(#gradient-forgot)" d="M0,30 Q100,10 200,30 T400,30 L400,80 L0,80 Z" />
              <defs>
                <linearGradient id="gradient-forgot" x1="0%" y1="0%" x2="100%" y2="0%">
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
