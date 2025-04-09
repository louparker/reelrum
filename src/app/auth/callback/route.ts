import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  
  // Handle error cases
  if (error) {
    console.error('Auth callback error:', error, error_description);
    
    // Redirect to login page with error message
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error_description || 'Authentication failed')}`, requestUrl.origin)
    );
  }

  // If no code is provided, redirect to home page
  if (!code) {
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  try {
    const supabase = createServerSupabaseClient();
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error.message);
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }
    
    // Successful authentication, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=An unexpected error occurred', requestUrl.origin)
    );
  }
}
