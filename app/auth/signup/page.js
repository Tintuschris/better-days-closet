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
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl opacity-90">
            Create an account to enjoy exclusive benefits, faster checkout, and personalized shopping experiences.
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
          <h1 className="text-4xl font-bold mb-2 text-primarycolor">CREATE</h1>
          <h1 className="text-4xl font-bold mb-8 text-primarycolor">ACCOUNT</h1>
          
          <p className="text-xl mb-8 text-primarycolor">Join Better Days Closet for a faster checkout and exclusive benefits!</p>
          
          <form onSubmit={handleSignUp} className="w-full space-y-6">
            <div>
              <label htmlFor="name" className="block text-secondarycolor mb-2">Name*</label>
              <input
                id="name"
                type="text"
                className="w-full p-2 border-b-2 border-gray-300 focus:border-primarycolor outline-none text-primarycolor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
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
            
            <button 
              type="submit" 
              className="w-full bg-primarycolor text-white py-3 rounded-full font-bold flex items-center justify-center hover:bg-primarycolor/90 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          {error && <p className="mt-4 text-warningcolor text-center">{error}</p>}
          
          <p className="mt-8 text-center">
            <span className="text-secondarycolor">Or have an account? </span>
            <Link href="/auth/login" className="text-primarycolor hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
