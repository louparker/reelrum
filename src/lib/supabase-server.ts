import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export function createServerSupabaseClient() {
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

  return createClient<Database>(supabaseUrl, supabaseKey);
}
