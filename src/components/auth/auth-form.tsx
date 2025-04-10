'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

// Form schema with validation
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
  type: 'login' | 'signup';
  error?: string;
  message?: string;
}

export function AuthForm({ type, error, message }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(error || null);
  const [formMessage, setFormMessage] = useState<string | null>(message || null);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setFormError(null);
    setFormMessage(null);

    try {
      if (type === 'login') {
        const result = await signIn(data.email, data.password);
        
        if (result.error) {
          console.error('Login error:', result.message);
          setFormError(result.message);
          return;
        }
        
        // The redirect is handled by the signIn function
      } else {
        const result = await signUp(data.email, data.password);
        
        if (result.error) {
          console.error('Signup error:', result.message);
          setFormError(result.message);
          return;
        }
        
        // Show success message for signup
        setFormMessage('Check your email to confirm your account');
        form.reset();
      }
    } catch (error: any) {
      console.error(`${type === 'login' ? 'Login' : 'Signup'} error:`, error);
      setFormError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          {type === 'login' ? 'Sign In' : 'Create an Account'}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {type === 'login'
            ? 'Enter your credentials to sign in to your account'
            : 'Enter your information to create an account'}
        </p>
      </div>

      {formError && (
        <Alert variant="destructive" className="my-4">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {formMessage && (
        <Alert className="my-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{formMessage}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    autoComplete={type === 'login' ? 'username' : 'email'}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete={type === 'login' ? 'current-password' : 'new-password'}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {type === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>{type === 'login' ? 'Sign In' : 'Create Account'}</>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center text-sm">
        {type === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/auth/login" className="underline">
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
