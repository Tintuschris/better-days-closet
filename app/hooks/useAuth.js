import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: 1000 * 60 * 30, // Session stays fresh for 30 minutes
    cacheTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const { data: userDetails } = useQuery({
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

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
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
  
      queryClient.invalidateQueries(['userDetails', userId]);
  
    } catch (err) {
      console.error('Error during signup:', err);
      throw err;
    }
  };

  return { user: session?.user, signIn, signOut, signUp, isAuthenticated: !!session?.user, userDetails };
};