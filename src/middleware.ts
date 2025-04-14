import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware for handling Supabase authentication
 * This middleware:
 * 1. Refreshes auth tokens
 * 2. Handles redirects for protected routes
 * 3. Redirects authenticated users away from auth pages
 */
export async function middleware(request: NextRequest) {
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client specifically for the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // This is safe in Next.js 14 middleware
          const cookie = request.cookies.get(name);
          return cookie?.value;
        },
        set(name, value, options) {
          // When setting cookies from middleware, we need to set them on
          // both the request (for supabase-js) and the response (for the browser)
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          // Similar to set, but with empty value and max-age=0
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // This will refresh the session if it exists
  // IMPORTANT: Use getUser() instead of getSession() for reliable auth checks
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get the current path
  const path = request.nextUrl.pathname;
  
  // Check if this is an auth route
  const isAuthRoute = path.startsWith('/auth') && 
    !path.startsWith('/auth/callback') && 
    !path.startsWith('/auth/confirm') &&
    !path.startsWith('/auth/logout');
  
  // Check if this is a protected route
  const isProtectedRoute = path.startsWith('/dashboard') || 
                          path.startsWith('/profile') || 
                          path.startsWith('/bookings') || 
                          path.startsWith('/properties/list');
  
  // Check if this is a public API route that doesn't need authentication
  const isPublicApiRoute = path.startsWith('/api/auth');
  
  // Check if this is a password reset flow
  const isPasswordResetFlow = path.startsWith('/auth/reset-password') && 
                              request.nextUrl.searchParams.has('code');
  
  // Skip middleware for public API routes
  if (isPublicApiRoute) {
    return response;
  }
  
  try {
    // Log session status for debugging
    console.log('Middleware session check:', path, user ? 'Session exists' : 'No session');
    
    // Special case: Allow authenticated users to access the reset-password page with a code
    if (user && isPasswordResetFlow) {
      console.log('Allowing authenticated user to access password reset flow');
      return response;
    }
    
    // Redirect from auth routes to dashboard if user is logged in
    if (user && isAuthRoute) {
      // If the user is trying to sign up as a provider, redirect to the property listing form
      const provider = request.nextUrl.searchParams.get('provider');
      if (provider === 'true') {
        console.log('Redirecting authenticated user from auth route to property listing');
        return NextResponse.redirect(new URL('/properties/list', request.url));
      }
      
      console.log('Redirecting authenticated user from auth route to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Redirect from protected routes to login if user is not logged in
    if (!user && isProtectedRoute) {
      console.log('Redirecting unauthenticated user from protected route to login');
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(redirectUrl);
    }
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error, allow the request to continue
    // The server components will handle authentication as needed
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
