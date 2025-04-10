import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/ui/logo';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth-server';

export const metadata: Metadata = {
  title: 'Reset Password | ReelRum',
  description: 'Reset your ReelRum account password',
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  // Check if user is already logged in
  const user = await getUser();
  
  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  // Safely extract and decode the error message
  const errorParam = searchParams.error;
  const errorMessage = errorParam 
    ? (typeof errorParam === 'string' ? decodeURIComponent(errorParam) : '') 
    : '';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          <AuthForm type="reset-password" />
        </div>
      </div>
    </div>
  );
}
