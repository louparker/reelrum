'use client';

import { getClient } from '@/lib/supabase/browser-client';

/**
 * Signs up a new user with email and password
 * This should only be used in Client Components
 */
export async function signUp(email: string, password: string) {
  try {
    const supabase = getClient();
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error signing up:', error);
    return { error, data: { session: null, user: null } };
  }
}

/**
 * Signs in a user with email and password
 * This should only be used in Client Components
 */
export async function signIn(email: string, password: string) {
  try {
    const supabase = getClient();
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return response;
  } catch (error) {
    console.error('Error signing in:', error);
    return { error, data: { session: null, user: null } };
  }
}

/**
 * Signs out the current user
 * This should only be used in Client Components
 */
export async function signOut() {
  try {
    const supabase = getClient();
    return await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: error as any };
  }
}

/**
 * Resets the password for a user
 * This should only be used in Client Components
 */
export async function resetPassword(email: string) {
  try {
    const supabase = getClient();
    const response = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return response;
  } catch (error) {
    console.error('Error resetting password:', error);
    return { error, data: {} };
  }
}

/**
 * Gets the current session from the client
 * This should only be used in Client Components
 */
export async function getClientSession() {
  try {
    const supabase = getClient();
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Sets up an auth state change listener
 * This should only be used in Client Components
 */
export function onAuthStateChange(callback: (session: any) => void) {
  try {
    const supabase = getClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session);
      }
    );
    return subscription;
  } catch (error) {
    console.error('Error setting up auth state change listener:', error);
    return {
      unsubscribe: () => {},
    };
  }
}
