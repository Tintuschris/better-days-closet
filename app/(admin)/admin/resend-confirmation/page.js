"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { FiMail, FiSend, FiCheck, FiX } from 'react-icons/fi';
import { PremiumCard, Button, GradientText } from '../../../components/ui';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState('betterdayscloset@gmail.com');
  const [isLoading, setIsLoading] = useState(false);
  const [userStatus, setUserStatus] = useState(null);

  const checkUserStatus = async (emailToCheck) => {
    try {
      const { data, error } = await supabase
        .from('auth.users')
        .select('id, email, email_confirmed_at, created_at')
        .eq('email', emailToCheck)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { exists: false };
        }
        throw error;
      }

      return {
        exists: true,
        confirmed: !!data.email_confirmed_at,
        confirmedAt: data.email_confirmed_at,
        createdAt: data.created_at,
        userId: data.id
      };
    } catch (error) {
      console.error('Error checking user status:', error);
      return { exists: false, error: error.message };
    }
  };

  const handleCheckStatus = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      const status = await checkUserStatus(email);
      setUserStatus(status);
      
      if (!status.exists) {
        toast.error('User not found with this email address');
      } else if (status.confirmed) {
        toast.success('User email is already confirmed!');
      } else {
        toast.info('User found - email needs confirmation');
      }
    } catch (error) {
      toast.error('Error checking user status');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      // First check user status
      const status = await checkUserStatus(email);
      
      if (!status.exists) {
        toast.error('User not found with this email address');
        return;
      }

      if (status.confirmed) {
        toast.success('User email is already confirmed!');
        return;
      }

      // Resend confirmation email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'https://www.betterdayscloset.com/auth/callback'
        }
      });

      if (error) {
        toast.error(`Error resending confirmation: ${error.message}`);
        return;
      }

      toast.success('Confirmation email sent successfully!');
      
    } catch (error) {
      toast.error('Unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <GradientText className="text-2xl font-bold mb-2">
          Resend Email Confirmation
        </GradientText>
        <p className="text-primarycolor/70">
          Resend confirmation emails for users who haven't verified their email addresses
        </p>
      </div>

      {/* Main Form */}
      <PremiumCard className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <FiMail className="w-6 h-6 text-primarycolor" />
            <h2 className="text-xl font-semibold text-primarycolor">Email Confirmation</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primarycolor mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter user email address"
                className="w-full px-4 py-3 border border-primarycolor/20 rounded-lg focus:outline-none focus:border-primarycolor focus:ring-2 focus:ring-primarycolor/10 transition-all duration-200"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCheckStatus}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4" />
                Check Status
              </Button>

              <Button
                onClick={handleResendConfirmation}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <FiSend className="w-4 h-4" />
                {isLoading ? 'Sending...' : 'Resend Confirmation'}
              </Button>
            </div>
          </div>

          {/* User Status Display */}
          {userStatus && (
            <div className="mt-6 p-4 bg-primarycolor/5 rounded-lg border border-primarycolor/10">
              <h3 className="font-semibold text-primarycolor mb-3">User Status</h3>
              
              {userStatus.exists ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-green-600" />
                    <span>User exists in database</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {userStatus.confirmed ? (
                      <>
                        <FiCheck className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">Email confirmed</span>
                        <span className="text-gray-500">
                          (on {new Date(userStatus.confirmedAt).toLocaleDateString()})
                        </span>
                      </>
                    ) : (
                      <>
                        <FiX className="w-4 h-4 text-red-600" />
                        <span className="text-red-700">Email not confirmed</span>
                      </>
                    )}
                  </div>
                  
                  <div className="text-gray-600">
                    <strong>User ID:</strong> {userStatus.userId}
                  </div>
                  
                  <div className="text-gray-600">
                    <strong>Created:</strong> {new Date(userStatus.createdAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <FiX className="w-4 h-4 text-red-600" />
                  <span className="text-red-700">User not found</span>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Enter the email address of the user who needs confirmation</li>
              <li>• Click "Check Status" to verify if the user exists and their confirmation status</li>
              <li>• Click "Resend Confirmation" to send a new confirmation email</li>
              <li>• The email will be sent to the user's inbox with a confirmation link</li>
            </ul>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}
