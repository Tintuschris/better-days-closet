"use client"
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, user, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await signUp(name, email, password);
      // Redirect handled by useEffect when user state updates
    } catch (err) {
      setError('Error creating account. Please try again.');
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
              <pattern id="grid-signup" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid-signup)" />
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
          <h2 className="text-4xl font-bold mb-6 leading-tight">Join Our Community</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Create an account to enjoy exclusive benefits, faster checkout, and personalized shopping experiences.
          </p>
          
          {/* Floating elements for visual interest */}
          <div className="absolute top-16 right-12 w-3 h-3 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-24 left-8 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute top-2/3 left-16 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
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
              Join Us Today
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primarycolor to-secondarycolor rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Create your Better Days Closet account
            </p>
          </div>
          
          {/* Enhanced status messages */}
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

          <form onSubmit={handleSignUp} className="space-y-8">
            <div className="space-y-6">
              <div className="group">
                <label htmlFor="name" className="block text-gray-700 mb-3 font-medium text-sm tracking-wide">
                  FULL NAME
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-primarycolor focus:bg-white focus:ring-4 focus:ring-primarycolor/10 outline-none text-primarycolor transition-all duration-200 group-hover:border-gray-300"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-2 h-2 bg-primarycolor/20 rounded-full"></div>
                  </div>
                </div>
              </div>
              
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
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    minLength={6}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-2 h-2 bg-primarycolor/20 rounded-full"></div>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className={`h-1 flex-1 rounded ${password.length >= 6 ? 'bg-green-400' : 'bg-gray-200'} transition-colors duration-200`}></div>
                  <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-green-400' : 'bg-gray-200'} transition-colors duration-200`}></div>
                  <div className={`h-1 flex-1 rounded ${password.length >= 10 ? 'bg-green-400' : 'bg-gray-200'} transition-colors duration-200`}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Password must be at least 6 characters</p>
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
                  Creating Account...
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <span>Already have an account?</span>
              <Link href="/auth/login" className="text-primarycolor font-semibold hover:text-primarycolor/80 transition-colors duration-200 relative group">
                Sign In
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primarycolor group-hover:w-full transition-all duration-200"></span>
              </Link>
            </div>
          </div>
          
          {/* Enhanced decorative element */}
          <div className="mt-16 opacity-5">
            <svg className="w-full h-20" viewBox="0 0 400 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="url(#gradient-signup)" d="M0,30 Q100,10 200,30 T400,30 L400,80 L0,80 Z" />
              <defs>
                <linearGradient id="gradient-signup" x1="0%" y1="0%" x2="100%" y2="0%">
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
