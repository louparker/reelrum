import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from './supabase-server';

export async function getSession() {
  const supabase = createServerSupabaseClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }
  return session;
}

export async function requireNoAuth() {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }
}
