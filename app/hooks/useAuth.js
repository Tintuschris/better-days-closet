import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: session, isLoading: sessionLoading, refetch: refetchSession } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: 1000 * 60 * 30, // Session stays fresh for 30 minutes
    cacheTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const { data: userDetails, isLoading: userDetailsLoading } = useQuery({
    queryKey: ['userDetails', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session?.user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // User details stay fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // Set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          await queryClient.invalidateQueries(['session']);
          await queryClient.invalidateQueries(['userDetails']);
        } else if (event === 'SIGNED_OUT') {
          queryClient.clear();
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [queryClient]);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Force a refetch of the session
    await refetchSession();
    return true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    router.push('/');
  };

  const signUp = async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
  
      if (error) {
        throw error;
      }
  
      const userId = data?.user?.id;
  
      if (!userId) {
        throw new Error('User ID not found after signup');
      }
  
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId, name, email }]);
  
      if (insertError) {
        throw insertError;
      }
  
      await queryClient.invalidateQueries(['userDetails', userId]);
      await refetchSession();
      
      return true;
    } catch (err) {
      console.error('Error during signup:', err);
      throw err;
    }
  };

  const resetPasswordForEmail = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  const resetPassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    
    // After password reset, redirect to login
    router.push('/auth/login');
  };

  return { 
    user: session?.user, 
    userDetails,
    signIn, 
    signOut, 
    signUp, 
    resetPasswordForEmail,
    resetPassword,
    isAuthenticated: !!session?.user, 
    isLoading: sessionLoading || userDetailsLoading
  };
};
