import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/ui/logo';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const metadata: Metadata = {
  title: 'Reset Password | ReelRum',
  description: 'Reset your ReelRum account password',
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  console.log('===== RESET PASSWORD PAGE =====');
  console.log('Search params:', searchParams);
  
  // Check if user is already logged in
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  
  console.log('User authenticated:', !!data.user);
  
  // Get parameters from searchParams safely
  const codeParam = searchParams?.code || null;
  const typeParam = searchParams?.type || 'recovery'; // Default to recovery if not specified
  const errorParam = searchParams?.error || null;
  
  console.log('Extracted params:', { 
    code: codeParam ? 'exists' : 'missing', 
    type: typeParam,
    error: errorParam 
  });
  
  // Safely handle potentially array values
  const code = typeof codeParam === 'string' ? codeParam : undefined;
  const type = typeof typeParam === 'string' ? typeParam : undefined;
  
  // If user is logged in and this is not a password reset flow, redirect to dashboard
  if (data.user && !(code && type === 'recovery')) {
    console.log('User is logged in and not in reset flow, redirecting to dashboard');
    redirect('/dashboard');
  }

  // Safely extract and decode the error message
  const errorMessage = errorParam 
    ? (typeof errorParam === 'string' ? decodeURIComponent(errorParam) : '') 
    : '';
    
  // Check if this is a password update after reset
  // If we have a code, treat it as a password update flow even if type is missing
  const isUpdate = typeof code === 'string';
  console.log('Is password update flow:', isUpdate);

  // If we don't have a code but we have a session, try to get the code from the session
  let finalCode = code;
  if (!finalCode && data.session) {
    try {
      console.log('Attempting to get code from session');
      // The session might contain the code needed for password reset
      const { error } = await supabase.auth.updateUser({
        password: 'TEMPORARY_CHECK_ONLY_DO_NOT_USE',
      });
      
      if (!error) {
        console.log('Session appears valid for password reset');
        finalCode = 'session-based';
      } else {
        console.log('Session not valid for password reset:', error.message);
      }
    } catch (err) {
      console.error('Error checking session for password reset capability:', err);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          <AuthForm 
            type={isUpdate ? "update-password" : "reset-password"} 
            code={finalCode}
          />
        </div>
      </div>
    </div>
  );
}
