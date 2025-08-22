"use client"
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { setCookie, getCookie, hasCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cookieConsent, setCookieConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkCookieConsent = () => {
      if (hasCookie('cookieConsent')) {
        setCookieConsent(true);
        const rememberedEmail = getCookie('rememberedEmail');
        if (rememberedEmail) {
          setEmail(rememberedEmail);
          setRememberMe(true);
        }
      }
    };
    checkCookieConsent();

    // Check for error messages from URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      const messageParam = urlParams.get('message');

      if (errorParam) {
        if (errorParam === 'invalid_callback') {
          setError('Invalid authentication link. Please try again.');
        } else if (errorParam === 'access_denied') {
          setError(messageParam || 'Access was denied or the link is invalid.');
        } else if (errorParam === 'auth_callback_error') {
          setError('Authentication failed. Please try again.');
        } else if (errorParam === 'auth_exchange_error') {
          setError('Failed to complete authentication. Please try again.');
        } else if (messageParam) {
          setError(decodeURIComponent(messageParam));
        } else {
          setError('Authentication failed. Please try again.');
        }
      } else if (messageParam) {
        // Handle success messages (like password reset success)
        setMessage(decodeURIComponent(messageParam));
      }
    }
  }, []);

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await signIn(email, password);
      
      if (rememberMe && cookieConsent) {
        setCookie('rememberedEmail', email, { 
          maxAge: 30 * 24 * 60 * 60, // 30 days
          sameSite: 'strict'
        });
      } else {
        setCookie('rememberedEmail', '', { maxAge: 0 });
      }
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCookieConsent = () => {
    setCookie('cookieConsent', 'true', { maxAge: 365 * 24 * 60 * 60 }); // 1 year
    setCookieConsent(true);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Enhanced brand imagery */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primarycolor via-purple-700 to-purple-900 justify-center items-center p-12 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
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
          <h2 className="text-4xl font-bold mb-6 leading-tight">Welcome Back!</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Sign in to access your wishlist, track orders, and enjoy a personalized shopping experience.
          </p>
          
          {/* Floating elements for visual interest */}
          <div className="absolute top-20 left-10 w-3 h-3 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-8 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
        </div>
      </div>
      
      {/* Right side - Enhanced auth form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Enhanced back button */}
          <Link href="/" className="inline-flex items-center text-primarycolor mb-10 hover:text-primarycolor/80 transition-all duration-200 group">
            <div className="p-2 rounded-lg group-hover:bg-gray-50 transition-colors duration-200">
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Back to Home</span>
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
              Welcome Back
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primarycolor to-secondarycolor rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Sign in to your Better Days Closet account
            </p>
          </div>
          
          {/* Enhanced status messages */}
          {message && (
            <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-xl">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-700 text-sm font-medium">{message}</p>
              </div>
            </div>
          )}

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

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
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
              
              <div className="group">
                <label htmlFor="password" className="block text-gray-700 mb-3 font-medium text-sm tracking-wide">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-primarycolor focus:bg-white focus:ring-4 focus:ring-primarycolor/10 outline-none text-primarycolor transition-all duration-200 group-hover:border-gray-300"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-2 h-2 bg-primarycolor/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <label className="flex items-center group cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${rememberMe ? 'bg-primarycolor border-primarycolor' : 'bg-white border-gray-300 group-hover:border-primarycolor'}`}>
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm text-gray-600 font-medium">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-primarycolor font-medium hover:text-primarycolor/80 transition-colors duration-200 relative group">
                Forgot password?
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primarycolor group-hover:w-full transition-all duration-200"></span>
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primarycolor to-purple-700 text-white py-4 rounded-2xl font-semibold flex items-center justify-center hover:from-primarycolor/90 hover:to-purple-700/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-3" />
                  Signing In...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
          
          {!cookieConsent && (
            <div className="mt-8 p-6 bg-gradient-to-r from-secondarycolor/5 to-primarycolor/5 border border-secondarycolor/20 rounded-2xl backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primarycolor/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-primarycolor" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-primarycolor text-sm font-medium mb-3">
                    We use cookies to improve your experience and provide personalized features.
                  </p>
                  <button 
                    onClick={handleCookieConsent} 
                    className="bg-primarycolor text-white py-2 px-6 rounded-xl text-sm font-medium hover:bg-primarycolor/90 transition-all duration-200 transform hover:scale-105"
                  >
                    Accept Cookies
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <span>Don&apos;t have an account?</span>
              <Link href="/auth/signup" className="text-primarycolor font-semibold hover:text-primarycolor/80 transition-colors duration-200 relative group">
                Create Account
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primarycolor group-hover:w-full transition-all duration-200"></span>
              </Link>
            </div>
          </div>
          
          {/* Enhanced decorative element */}
          <div className="mt-16 opacity-5">
            <svg className="w-full h-20" viewBox="0 0 400 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="url(#gradient)" d="M0,30 Q100,10 200,30 T400,30 L400,80 L0,80 Z" />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
