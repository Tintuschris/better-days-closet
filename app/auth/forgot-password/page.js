"use client"
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await resetPasswordForEmail(email);
      setMessage('Reset email sent! Please check your inbox.');
      setError('');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-primarycolor p-4">
      <Link href="/auth/login" className="self-start mb-8">
        <ChevronLeft />
      </Link>
      
      <h1 className="text-4xl font-bold mb-2">FORGOT</h1>
      <h1 className="text-4xl font-bold mb-8">PASSWORD</h1>
      
      <p className="text-xl mb-8">Enter your email to receive a password reset link.</p>

      {error && <p className="mt-4 text-warningcolor text-center">{error}</p>}
      {message && <p className="mt-4 text-green-500 text-center">{message}</p>}

      <form onSubmit={handleReset} className="w-full">
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
        
        <button type="submit" className="w-full bg-primarycolor text-white py-3 rounded-full font-bold mt-4">
          Send Reset Link
        </button>
      </form>
      
      <p className="mt-8 text-center">
        <span className="text-secondarycolor">Remember your password? </span>
        <Link href="/auth/login" className="text-primarycolor underline">Log In</Link>
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
