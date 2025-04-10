'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  signIn as clientSignIn, 
  signUp as clientSignUp, 
  signOut as clientSignOut, 
  resetPassword as clientResetPassword,
  getClientSession,
  onAuthStateChange
} from '@/lib/auth-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Skip initialization on the server
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        setIsLoading(true);
        
        // Get initial session
        const initialSession = await getClientSession();
        console.log('Initial session result:', initialSession ? 'Session exists' : 'No session');
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // Set up auth state change listener
        const subscription = onAuthStateChange((newSession) => {
          console.log('Auth state changed:', newSession ? 'Session exists' : 'No session');
          setSession(newSession);
          setUser(newSession?.user ?? null);
          router.refresh();
        });
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Signing up with email:', email);
      const response = await clientSignUp(email, password);
      console.log('Signup response:', response);
      return response;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with email:', email);
      const response = await clientSignIn(email, password);
      console.log('Sign in response:', response);

      if (response.error) {
        return response;
      }

      if (response.data.session) {
        // Update local state
        setSession(response.data.session);
        setUser(response.data.user);
      }

      return response;
    } catch (error) {
      console.error('Error signing in:', error);
      return { error, data: { session: null, user: null } };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await clientSignOut();
      setSession(null);
      setUser(null);
      console.log('Signed out successfully');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Resetting password for email:', email);
      const response = await clientResetPassword(email);
      console.log('Reset password response:', response);
      return response;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
