import { AuthForm } from '@/components/auth/auth-form';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth-server';

export const metadata: Metadata = {
  title: 'Login | ReelRum',
  description: 'Login to your ReelRum account',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // Check if user is already logged in
  const user = await getUser();
  if (user) {
    redirect('/dashboard');
  }

  const errorMessage = searchParams.error ? decodeURIComponent(searchParams.error) : '';

  return (
    <div className="container flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <a
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </a>
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        <AuthForm type="login" />
      </div>
    </div>
  );
}
