'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

// Create a singleton instance of the Supabase client
let supabaseClient: any = null

// This function will only be called on the client side
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return null
  }
  
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            const cookies = document.cookie.split('; ')
            const cookie = cookies.find((c) => c.startsWith(`${name}=`))
            return cookie ? cookie.split('=')[1] : undefined
          },
          set(name, value, options) {
            let cookie = `${name}=${value}`
            if (options?.expires) {
              cookie += `; expires=${options.expires.toUTCString()}`
            }
            if (options?.path) {
              cookie += `; path=${options.path}`
            }
            if (options?.domain) {
              cookie += `; domain=${options.domain}`
            }
            if (options?.sameSite) {
              cookie += `; samesite=${options.sameSite}`
            }
            if (options?.secure) {
              cookie += '; secure'
            }
            document.cookie = cookie
          },
          remove(name, options) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${options?.path || '/'}`
          }
        }
      }
    )
  }
  
  return supabaseClient
}

// Export a singleton instance for client components
export const supabase = getSupabaseClient()

// For backwards compatibility
export function createBrowserSupabaseClient() {
  return getSupabaseClient()
}
