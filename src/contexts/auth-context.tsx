'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserSupabaseClient> | null>(null);
  const router = useRouter();

  // Initialize Supabase client on the client side only
  useEffect(() => {
    // Create the Supabase client
    const client = createBrowserSupabaseClient();
    setSupabase(client);

    return () => {
      // Nothing to clean up for the client itself
    };
  }, []);

  // Set up auth state once the client is available
  useEffect(() => {
    if (!supabase) return;

    // Set initial session and user
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get the initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            // Refresh the router to update server components
            router.refresh();
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const unsubscribe = initializeAuth();
    
    return () => {
      // Clean up subscription when component unmounts
      unsubscribe.then((unsub) => unsub && unsub());
    };
  }, [supabase, router]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new AuthError('Supabase client not initialized') };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      return { 
        error: new AuthError('An unexpected error occurred during sign in') 
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new AuthError('Supabase client not initialized') };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      return { error };
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      return { 
        error: new AuthError('An unexpected error occurred during sign up') 
      };
    }
  };

  const signOut = async () => {
    console.log('===== AUTH CONTEXT: SIGN OUT =====');
    
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }

    try {
      console.log('Signing out user');
      await supabase.auth.signOut();
      
      // Force a hard redirect to the home page
      console.log('Redirecting to home page');
      window.location.href = '/';
      
      // The following code won't execute due to the hard redirect,
      // but we keep it as a fallback
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: new AuthError('Supabase client not initialized') };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback/reset-password`,
      });
      
      return { error };
    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      return { 
        error: new AuthError('An unexpected error occurred during password reset') 
      };
    }
  };

  const updatePassword = async (password: string) => {
    console.log('===== AUTH CONTEXT: UPDATE PASSWORD =====');
    
    if (!supabase) {
      console.error('Supabase client not initialized');
      return { error: new AuthError('Supabase client not initialized') };
    }

    try {
      console.log('Calling supabase.auth.updateUser with new password');
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        console.error('Supabase updateUser error:', error.message);
      } else {
        console.log('Password updated successfully in Supabase');
      }
      
      return { error };
    } catch (err) {
      console.error('Unexpected error during password update:', err);
      return { 
        error: new AuthError('An unexpected error occurred during password update') 
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
