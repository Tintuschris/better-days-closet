"use client";
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate if both passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const accessToken = router.query.access_token; // Extract the token from the URL
    if (!accessToken) {
      setError('Invalid reset token');
      return;
    }

    // Update the user's password using the token from the reset link
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError('Failed to reset password');
    } else {
      setMessage('Password reset successfully. You can now log in.');
      // Optionally redirect the user to login page after successful reset
      router.push('/auth/login');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4 font-semibold text-center">Reset Password</h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {message && <p className="text-green-500 text-center mb-4">{message}</p>}

      <form onSubmit={handleResetPassword}>
        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 border rounded mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full p-2 border rounded mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-600 transition-all"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
