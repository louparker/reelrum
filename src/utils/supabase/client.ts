'use client'

// Re-export the standardized client from our lib folder
import { supabaseClient } from '@/lib/supabase-client'

export function createClient() {
  return supabaseClient
}
