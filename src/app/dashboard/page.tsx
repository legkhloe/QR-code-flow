"use client"; // Required because we use hooks like useAuth and useRouter client-side for redirection.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import QrCodeGenerator from '@/components/dashboard/QrCodeGenerator';
import { Skeleton } from '@/components/ui/skeleton';
import { appName } from '@/lib/config';
// Metadata can't be dynamically generated in a client component easily.
// For dynamic metadata based on auth, a server component wrapper would be needed.
// For now, we'll keep it simple. Consider this if SEO for dashboard is critical.
// export const metadata: Metadata = {
// title: `Dashboard | ${appName}`,
// description: `Manage your QR codes with ${appName}.`,
// };


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // Show a loading skeleton or a message while checking auth or redirecting
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full rounded-lg bg-muted" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg bg-muted" />
            <Skeleton className="h-48 w-full rounded-lg bg-muted" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-72 w-full rounded-lg bg-muted" />
            <Skeleton className="h-96 w-full rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h1>
      <QrCodeGenerator />
    </div>
  );
}
