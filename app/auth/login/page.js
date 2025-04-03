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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Brand imagery (desktop only) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primarycolor to-purple-800 justify-center items-center p-12">
        <div className="max-w-md text-white">
          <Image 
            src="/logo.png" 
            alt="Better Days Closet" 
            width={80} 
            height={80}
            className="mb-8" 
            priority
          />
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-xl opacity-90">
            Log in to your account to access your wishlist, track orders, and enjoy a personalized shopping experience.
          </p>
        </div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back button - both mobile and desktop */}
          <Link href="/" className="self-start mb-8 inline-block text-primarycolor">
            <ChevronLeft size={24} />
          </Link>
          
          {/* Title - broken into two lines on mobile */}
          <h1 className="text-4xl font-bold mb-2 text-primarycolor">LOG</h1>
          <h1 className="text-4xl font-bold mb-8 text-primarycolor">IN</h1>
          
          <p className="text-xl mb-8 text-primarycolor">Welcome back to Better Days Closet!</p>
          
          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div>
              <label htmlFor="email" className="block text-secondarycolor mb-2">Email*</label>
              <input
                id="email"
                type="email"
                className="w-full p-2 border-b-2 border-gray-300 focus:border-primarycolor outline-none text-primarycolor"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-secondarycolor mb-2">Password*</label>
              <input
                id="password"
                type="password"
                className="w-full p-2 border-b-2 border-gray-300 focus:border-primarycolor outline-none text-primarycolor"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 text-primarycolor rounded focus:ring-primarycolor"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-sm text-gray-500">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-primarycolor hover:underline">
                Forgot password?
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-primarycolor text-white py-3 rounded-full font-bold flex items-center justify-center hover:bg-primarycolor/90 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>
          
          {!cookieConsent && (
            <div className="mt-6 p-4 bg-secondaryvariant rounded-lg">
              <p className="text-primarycolor">We use cookies to improve your experience. Do you consent to cookies?</p>
              <button 
                onClick={handleCookieConsent} 
                className="mt-2 bg-primarycolor text-white py-2 px-4 rounded-full text-sm hover:bg-primarycolor/90 transition-colors"
              >
                I Consent
              </button>
            </div>
          )}
          
          {error && <p className="mt-4 text-warningcolor text-center">{error}</p>}
          
          <p className="mt-8 text-center">
            <span className="text-secondarycolor">Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="text-primarycolor hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
