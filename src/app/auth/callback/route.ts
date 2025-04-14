import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Route handler for OAuth callbacks
 * This handles redirects from OAuth providers (Google, GitHub, etc.)
 * and also password reset flows
 */
export async function GET(request: NextRequest) {
  console.log('===== AUTH CALLBACK MAIN ROUTE =====');
  console.log('Request URL:', request.url);
  
  const requestUrl = new URL(request.url);
  console.log('Search params:', Object.fromEntries(requestUrl.searchParams.entries()));
  
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  
  console.log('Extracted params:', { code: code ? 'exists' : 'missing', type, next });
  
  // Handle password reset flow - if we have a code and either:
  // 1. Type is explicitly "recovery" or
  // 2. No type is specified (Supabase sometimes omits it)
  if (code && (!type || type === 'recovery')) {
    console.log('Detected password recovery flow, redirecting to reset-password page');
    return NextResponse.redirect(
      new URL(`/auth/reset-password?code=${code}&type=recovery`, requestUrl.origin)
    );
  }
  
  if (code) {
    try {
      console.log('Exchanging code for session');
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, request.url));
      }
      
      console.log('Successfully exchanged code for session');
    } catch (err) {
      console.error('Unexpected error during OAuth callback:', err);
      return NextResponse.redirect(new URL('/auth/error?error=Authentication+failed', request.url));
    }
  }
  
  // URL to redirect to after sign in process completes
  console.log('Redirecting to:', next);
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
