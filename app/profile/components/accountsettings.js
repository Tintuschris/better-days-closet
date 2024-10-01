"use client"
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AccountSettings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    // Implement logic to update user information
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Account Settings</h2>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Update</button>
      </form>
    </div>
  );
}
