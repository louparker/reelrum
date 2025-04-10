import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

/**
 * Creates a server-side Supabase client with proper cookie handling
 * This should only be used in Server Components, API Routes, and Server Actions
 */
export async function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Gets the current session from the server
 * This should only be used in Server Components and Server Actions
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Gets the current user from the server
 * This should only be used in Server Components and Server Actions
 */
export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Requires authentication and redirects to login if not authenticated
 * This should only be used in Server Components
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }
  return session;
}

/**
 * Requires no authentication and redirects to dashboard if authenticated
 * This should only be used in Server Components
 */
export async function requireNoAuth() {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }
}
