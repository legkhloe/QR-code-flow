
"use client"; 

import { Suspense } from 'react';
import QrCodeGenerator from '@/components/dashboard/QrCodeGenerator';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton remains largely the same, might need minor tweaks if layout changes too drastically.
// For now, it will show a simplified loading state.
function DashboardPageSkeleton() {
  return (
    <div className="flex flex-1 w-full h-full p-4">
      {/* Left Sidebar Skeleton */}
      <div className="w-16 md:w-20 lg:w-60 p-4 border-r border-border space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      {/* Main Content Skeleton */}
      <div className="flex-1 p-4 space-y-4">
        <Skeleton className="h-12 w-full mb-4" /> {/* Top bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" /> {/* Content form */}
            <Skeleton className="h-64 w-full" /> {/* Preview */}
          </div>
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-48 w-full" /> {/* Customization */}
            <Skeleton className="h-48 w-full" /> {/* AI Suggestions */}
          </div>
        </div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  return (
    // QrCodeGenerator will now manage its own full-height, multi-column layout
    <Suspense fallback={<DashboardPageSkeleton />}>
      <QrCodeGenerator />
    </Suspense>
  );
}
