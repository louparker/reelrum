import { AuthForm } from '@/components/auth/auth-form';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | ReelRum',
  description: 'Sign in to your ReelRum account',
};

interface LoginPageProps {
  searchParams: {
    error?: string;
    message?: string;
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Ensure user is not already authenticated
  const session = await getServerSession(authOptions);
  
  // Redirect to dashboard if already authenticated
  if (session) {
    redirect('/dashboard');
  }
  
  // Get error and message from URL params
  const error = searchParams.error;
  const message = searchParams.message;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Welcome back to ReelRum
          </h2>
        </div>
        
        <div className="bg-white p-8 shadow rounded-lg">
          <AuthForm type="login" error={error} message={message} />
        </div>
      </div>
    </div>
  );
}
