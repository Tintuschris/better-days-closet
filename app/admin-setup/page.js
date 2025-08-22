"use client";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FiUser, FiLock, FiMail, FiShield } from 'react-icons/fi';
import { PremiumCard, Button, GradientText } from '../components/ui';

export default function AdminSetup() {
  const [formData, setFormData] = useState({
    email: 'betterdayscloset@gmail.com',
    password: '',
    confirmPassword: '',
    name: 'Better Days Closet'
  });
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await fetch('/api/admin/create-admin');
      const data = await response.json();
      setAdminExists(data.adminExists);
    } catch (error) {
      console.error('Error checking admin:', error);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin user');
      }

      toast.success('Admin user created successfully! You can now log in.');
      setAdminExists(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);

    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primarycolor/5 to-secondarycolor/5 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primarycolor"></div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primarycolor/5 to-secondarycolor/5 flex items-center justify-center p-4">
        <PremiumCard className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="w-8 h-8 text-green-600" />
          </div>
          <GradientText className="text-2xl font-bold mb-4">
            Admin Already Exists
          </GradientText>
          <p className="text-primarycolor/70 mb-6">
            The admin account has already been created. Please log in to access the admin panel.
          </p>
          <Button
            onClick={() => window.location.href = '/auth/login'}
            variant="primary"
            className="w-full"
          >
            Go to Login
          </Button>
        </PremiumCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primarycolor/5 to-secondarycolor/5 flex items-center justify-center p-4">
      <PremiumCard className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primarycolor/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="w-8 h-8 text-primarycolor" />
          </div>
          <GradientText className="text-2xl font-bold mb-2">
            Admin Setup
          </GradientText>
          <p className="text-primarycolor/70">
            Create the admin account for Better Days Closet
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primarycolor mb-2">
              <FiMail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primarycolor focus:border-transparent bg-gray-50"
              required
              disabled
            />
            <p className="text-xs text-primarycolor/60 mt-1">
              This is the designated admin email address
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-primarycolor mb-2">
              <FiUser className="w-4 h-4 inline mr-2" />
              Admin Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primarycolor focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primarycolor mb-2">
              <FiLock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primarycolor focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primarycolor mb-2">
              <FiLock className="w-4 h-4 inline mr-2" />
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primarycolor focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full py-3"
          >
            {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Security Note:</strong> This setup page is only available in development mode. 
            The admin account will be created through proper Supabase Auth with secure password hashing.
          </p>
        </div>
      </PremiumCard>
    </div>
  );
}
