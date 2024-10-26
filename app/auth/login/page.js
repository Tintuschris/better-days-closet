"use client"
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ChevronLeft } from 'lucide-react';
import { setCookie, getCookie, hasCookie } from 'cookies-next';
import Link from 'next/link';

export default function LoginPage() {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [cookieConsent, setCookieConsent] = useState(false);

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
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
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
    }
  };

  const handleCookieConsent = () => {
    setCookie('cookieConsent', 'true', { maxAge: 365 * 24 * 60 * 60 }); // 1 year
    setCookieConsent(true);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-primarycolor p-4">
      <button className="self-start mb-8">
        {/* Back arrow icon */}
        <ChevronLeft/>
      </button>
      
      <h1 className="text-4xl font-bold mb-2">LOG</h1>
      <h1 className="text-4xl font-bold mb-8">IN</h1>
      
      <p className="text-xl mb-8">Welcome back to Better Days Closet!</p>
      
      <form onSubmit={handleLogin} className="w-full">
        <div className="mb-6">
          <label htmlFor="email" className="block text-secondarycolor mb-2">Email*</label>
          <input
            id="email"
            type="email"
            className="w-full p-2 border-b-2 border-gray-300 focus:border-primarycolor outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-secondarycolor mb-2">Password*</label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border-b-2 border-gray-300 focus:border-primarycolor outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2 text-lg"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="text-sm">Remember me</span>
          </label>
          <a href="/auth/forgot-password" className="text-sm text-primarycolor underline">Forgot password?</a>
        </div>
        
        <button type="submit" className="w-full bg-primarycolor text-white py-3 rounded-full font-bold">Log In</button>
      </form>
      
      {!cookieConsent && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>We use cookies to improve your experience. Do you consent to cookies?</p>
          <button onClick={handleCookieConsent} className="mt-2 bg-primarycolor text-white py-2 px-4 rounded">
            I Consent
          </button>
        </div>
      )}
      
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      
      <p className="mt-8 text-center">
        <span className="text-secondarycolor">Don&apos;t have an account? </span>
        <Link href="/auth/signup" className="text-primarycolor underline">Create account</Link>
      </p>
      
      {/* Pink wave at the bottom */}
      <div className="fixed bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#FC9AE7" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,176C384,192,480,192,576,181.3C672,171,768,149,864,149.3C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
}
