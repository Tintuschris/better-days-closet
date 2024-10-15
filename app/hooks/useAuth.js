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
    try {
      // Sign up the user using Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
  
      if (error) {
        throw error; // Handle signup errors
      }
  
      // Extract the user ID from the response
      const userId = data?.user?.id; // Extract user ID safely
  
      if (!userId) {
        throw new Error('User ID not found after signup');
      }
  
      // After successful sign-up, insert user details into the users table
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId, name, email }]);
  
      if (insertError) {
        throw insertError; // Handle insertion errors
      }
  
    } catch (err) {
      console.error('Error during signup:', err);
      throw err; // Re-throw the error to be handled by the calling function
    }
  };
  


  

  return { user, signIn, signOut, signUp };
};
