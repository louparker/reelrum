import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Check if this is an auth route
  const isAuthRoute = path.startsWith('/auth') && 
    !path.startsWith('/auth/callback') && 
    !path.startsWith('/auth/logout');
  
  // Check if this is a protected route
  const isProtectedRoute = path.startsWith('/dashboard') || 
                          path.startsWith('/profile') || 
                          path.startsWith('/bookings') || 
                          path.startsWith('/properties');
  
  // Check if this is a public API route that doesn't need authentication
  const isPublicApiRoute = path.startsWith('/api/auth');
  
  // Skip middleware for public API routes
  if (isPublicApiRoute) {
    return NextResponse.next();
  }
  
  try {
    // Get the token from the request
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Log session status for debugging
    console.log('Middleware session check:', path, token ? 'Session exists' : 'No session');
    
    // Redirect from auth routes to dashboard if user is logged in
    if (token && isAuthRoute) {
      // If the user is trying to sign up as a provider, redirect to the property listing form
      if (req.nextUrl.searchParams.get('provider') === 'true') {
        console.log('Redirecting authenticated user from auth route to property listing');
        return NextResponse.redirect(new URL('/properties/list', req.url));
      }
      
      console.log('Redirecting authenticated user from auth route to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // Redirect from protected routes to login if user is not logged in
    if (!token && isProtectedRoute) {
      console.log('Redirecting unauthenticated user from protected route to login');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error, allow the request to continue
    // The server components will handle authentication as needed
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/auth/:path*',
    '/profile/:path*',
    '/bookings/:path*',
    '/properties/:path*',
    '/api/auth/:path*',
  ],
};
