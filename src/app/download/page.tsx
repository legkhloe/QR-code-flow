
"use client";

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import QrCodePreview from '@/components/dashboard/QrCodePreview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CustomizationOptionsSchema } from '@/lib/schemas'; // For validation
import { Skeleton } from '@/components/ui/skeleton';

function DownloadQrContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const qrValue = searchParams.get('qrValue') || "https://example.com";
  
  const options = {
    fgColor: searchParams.get('fgColor') || '#E0E0E0',
    bgColor: searchParams.get('bgColor') || '#1E1E1E',
    level: (searchParams.get('level') as 'L' | 'M' | 'Q' | 'H') || 'M',
    size: parseInt(searchParams.get('size') || '256', 10),
    margin: searchParams.get('margin') === 'true',
  };

  // Validate options (optional, but good practice)
  try {
    CustomizationOptionsSchema.parse(options);
  } catch (error) {
    console.error("Invalid customization options from URL:", error);
    // Handle error, e.g., redirect or show message
    // For now, we'll proceed with defaults if parsing fails
  }


  if (!qrValue) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>QR code data not found. Please try creating your QR code again.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/create')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Create
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-lg">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Download Your QR Code</CardTitle>
          <CardDescription>Your QR code is ready! Choose your preferred format below.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <QrCodePreview
            value={qrValue}
            size={options.size}
            fgColor={options.fgColor}
            bgColor={options.bgColor}
            level={options.level}
            includeMargin={options.margin}
          />
          <Button onClick={() => router.push('/create')} variant="outline" className="w-full sm:w-auto">
             <ArrowLeft className="mr-2 h-4 w-4" /> Create Another QR Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function DownloadQrPage() {
  return (
    <Suspense fallback={<DownloadQrPageSkeleton/>}>
      <DownloadQrContent />
    </Suspense>
  );
}

function DownloadQrPageSkeleton() {
  return (
     <div className="container mx-auto py-8 max-w-lg">
      <Card className="shadow-xl">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <Skeleton className="h-64 w-64 rounded-lg" />
          <div className="flex space-x-2 w-full">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-1/3" />
          </div>
          <Skeleton className="h-10 w-1/2" />
        </CardContent>
      </Card>
    </div>
  )
}
