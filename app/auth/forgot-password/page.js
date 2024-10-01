"use client"
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setMessage('Failed to send reset email');
    } else {
      setMessage('Reset email sent!');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Forgot Password</h1>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded w-full">Reset Password</button>
      </form>
      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
}
