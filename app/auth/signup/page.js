"use client"
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function SignupPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signUp(name, email, password); // Sign up in Supabase
      setSuccess('Account created successfully. Please log in.');
      window.location.href = '/auth/login'; // Redirect to login after signup
    } catch (err) {
      setError('Signup failed');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Create Account</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 border rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded w-full">
          Sign Up
        </button>
      </form>
      <p className="mt-4">Already have an account? <a href="/auth/login" className="text-blue-500">Log In</a></p>
    </div>
  );
}
