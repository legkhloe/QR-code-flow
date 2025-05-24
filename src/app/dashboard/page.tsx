
"use client"; 

import { Suspense } from 'react';
import QrCodeGenerator from '@/components/dashboard/QrCodeGenerator';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardPageSkeleton() {
  return (
    <div>
      <Skeleton className="h-10 w-1/4 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Skeleton className="h-80 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Advanced QR Code Editor</h1>
      <Suspense fallback={<DashboardPageSkeleton />}>
        <QrCodeGenerator />
      </Suspense>
    </div>
  );
}
