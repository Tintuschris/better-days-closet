import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Make useEffect asynchronous to handle promises
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();  // Use getSession to get session data
      setUser(session?.user || null);
    };

    getSession();  // Call the function to get the session

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();  // Updated unsubscribe pattern
    };
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signUp = async (name, email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Optionally save user details like name to another table
  };

  return { user, signIn, signOut, signUp };
};
