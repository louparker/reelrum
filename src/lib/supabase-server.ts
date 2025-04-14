import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers
 * This client properly handles cookies for authentication in the Next.js App Router
 */
export async function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          // This is safe in Next.js 14 middleware and server components
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name, value, options) {
          // This is safe in Next.js 14 middleware and server components
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          // This is safe in Next.js 14 middleware and server components
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}
