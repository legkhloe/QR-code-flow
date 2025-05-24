
"use client";

import QrCodePreview from '@/components/dashboard/QrCodePreview';
import CustomizationPanel, { type CustomizationOptions } from '@/components/dashboard/CustomizationPanel';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, DownloadIcon, Edit3 } from 'lucide-react'; // Replaced Edit with Edit3
import { Info } from 'lucide-react';


interface QrCustomizeAndActionProps {
  qrValue: string;
  options: CustomizationOptions;
  onOptionsChange: (newOptions: Partial<CustomizationOptions>) => void;
  onDownload: () => void;
  onGoToEditor: () => void;
  onBack: () => void;
}

export default function QrCustomizeAndAction({
  qrValue,
  options,
  onOptionsChange,
  onDownload,
  onGoToEditor,
  onBack,
}: QrCustomizeAndActionProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
           <QrCodePreview
            value={qrValue}
            size={options.size}
            fgColor={options.fgColor}
            bgColor={options.bgColor}
            level={options.level}
            includeMargin={options.margin}
          />
        </div>
        <div className="space-y-6">
          <CustomizationPanel options={options} onOptionsChange={onOptionsChange} />
        </div>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Pro Tip!</AlertTitle>
        <AlertDescription>
          Want to add your logo, change the dot patterns, or use more advanced styling? 
          Head to our <span className="font-semibold">Advanced Editor</span> for more options!
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Button onClick={onDownload} className="w-full sm:w-auto bg-secondary hover:bg-secondary/80 text-secondary-foreground">
            <DownloadIcon className="mr-2 h-4 w-4" /> Download QR Code
          </Button>
          <Button onClick={onGoToEditor} className="w-full sm:w-auto">
            <Edit3 className="mr-2 h-4 w-4" /> Advanced Editor
          </Button>
        </div>
      </div>
    </div>
  );
}
