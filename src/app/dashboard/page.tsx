import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard | ReelRum',
  description: 'Your ReelRum Dashboard',
};

export default async function DashboardPage() {
  // Get the authenticated user
  const user = await getCurrentUser();
  
  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth/login');
  }

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
          <Button variant="outline" asChild>
            <Link href="/api/auth/signout">Sign Out</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
