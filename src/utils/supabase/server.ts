import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

// Re-export the standardized server client from our lib folder
import { createServerSupabaseClient as createStandardizedClient } from '@/lib/auth-server'

export async function createClient() {
  return createStandardizedClient()
}
