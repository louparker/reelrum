import { NextRequest, NextResponse } from 'next/server';

/**
 * Route handler for password reset callbacks
 * This handles redirects from password reset emails
 */
export async function GET(request: NextRequest) {
  console.log('===== RESET PASSWORD CALLBACK =====');
  console.log('Request URL:', request.url);
  
  const requestUrl = new URL(request.url);
  console.log('Search params:', Object.fromEntries(requestUrl.searchParams.entries()));
  
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type') || 'recovery'; // Default to recovery if not provided
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  console.log('Extracted params (with defaults):', { 
    code: code ? 'exists' : 'missing', 
    type, 
    error, 
    errorDescription 
  });
  
  // If there's an error, log it and redirect to login with the error
  if (error) {
    console.log('Error detected in callback:', error, errorDescription);
    const loginUrl = new URL('/auth/login', requestUrl.origin);
    loginUrl.searchParams.set('error', error);
    if (errorDescription) {
      loginUrl.searchParams.set('error_description', errorDescription);
    }
    console.log('Redirecting to:', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }
  
  // If we have a code, treat it as a recovery flow even if type isn't specified
  if (code) {
    // Pass the code and type to the reset-password page
    const resetUrl = new URL(`/auth/reset-password?code=${code}&type=${type}`, requestUrl.origin);
    console.log('Valid recovery flow, redirecting to:', resetUrl.toString());
    return NextResponse.redirect(resetUrl);
  }
  
  // If not a valid recovery flow, redirect to login
  console.log('Invalid recovery flow, redirecting to login');
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
}
