import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        await fetchUserDetails(session.user.id);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        await fetchUserDetails(session.user.id);
      } else {
        setUserDetails(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserDetails = async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user details:', error);
    } else {
      setUserDetails(data);
    }
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setUserDetails(null);
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
  
      await fetchUserDetails(userId);
  
    } catch (err) {
      console.error('Error during signup:', err);
      throw err;
    }
  };

  return { user, signIn, signOut, signUp, isAuthenticated, userDetails };
};