"use client"; 

import QrCodeGenerator from '@/components/dashboard/QrCodeGenerator';
import { appName } from '@/lib/config';
// import type { Metadata } from 'next'; // Metadata needs to be handled differently for client components

// If you need dynamic title based on appName for SEO:
// export const metadata: Metadata = {
// title: `Dashboard | ${appName}`,
// description: `Manage your QR codes with ${appName}.`,
// };


export default function DashboardPage() {
  // Authentication checks and redirection are removed.
  // Loading skeleton related to auth is removed.

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h1>
      <QrCodeGenerator />
    </div>
  );
}
