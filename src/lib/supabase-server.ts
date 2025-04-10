import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  // For development without real Supabase credentials
  if (supabaseUrl === 'your_supabase_url' || supabaseKey === 'your_supabase_anon_key') {
    console.warn('Using placeholder Supabase credentials. Authentication functionality will not work properly.');
    return createClient<Database>(
      'https://placeholder-url.supabase.co',
      'placeholder-key'
    );
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'supabase.auth.token',
      },
      global: {
        headers: {
          'x-my-custom-header': 'reelrum-app',
        },
      },
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Handle cookie setting errors
            console.error('Error setting cookie:', error);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // Handle cookie removal errors
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}
