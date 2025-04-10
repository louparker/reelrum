'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

// Create a Supabase client for the browser
const createBrowserSupabaseClient = () => {
  // Use the Supabase project details from the environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          const cookies = document.cookie.split('; ');
          const cookie = cookies.find((c) => c.startsWith(`${name}=`));
          return cookie ? cookie.split('=')[1] : undefined;
        },
        set(name, value, options) {
          let cookie = `${name}=${value}`;
          if (options?.expires) {
            cookie += `; expires=${options.expires.toUTCString()}`;
          }
          if (options?.path) {
            cookie += `; path=${options.path}`;
          }
          if (options?.domain) {
            cookie += `; domain=${options.domain}`;
          }
          if (options?.sameSite) {
            cookie += `; samesite=${options.sameSite}`;
          }
          if (options?.secure) {
            cookie += '; secure';
          }
          document.cookie = cookie;
        },
        remove(name, options) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${options?.path || '/'}`;
        }
      }
    }
  );
};

// Create a singleton instance
let browserSupabase: ReturnType<typeof createBrowserSupabaseClient> | null = null;

export function getBrowserClient() {
  if (!browserSupabase) {
    browserSupabase = createBrowserSupabaseClient();
  }
  return browserSupabase;
}
