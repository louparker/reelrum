import { requireAuth } from '@/lib/auth-server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard | ReelRum',
  description: 'Your ReelRum dashboard',
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const user = session.user;

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
        <p className="text-zinc-600 mb-2">
          You are signed in as: <span className="font-medium">{user.email}</span>
        </p>
        <p className="text-zinc-600 mb-4">
          User ID: <span className="font-medium">{user.id}</span>
        </p>
        
        <div className="flex flex-wrap gap-4 mt-6">
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
          <Button variant="outline">
            <Link href="/auth/logout">Sign Out</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
