import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/ui/logo';
import { requireNoAuth } from '@/lib/auth-server';

export const metadata = {
  title: 'Login | ReelRum',
  description: 'Sign in to your ReelRum account',
};

export default async function LoginPage() {
  // Redirect to dashboard if already logged in
  await requireNoAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <AuthForm type="login" />
        </div>
      </div>
    </div>
  );
}
