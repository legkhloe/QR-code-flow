
"use client";

import QrCodePreview from '@/components/dashboard/QrCodePreview';
// CustomizationPanel is no longer imported or used here
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, DownloadIcon, Edit3, Info } from 'lucide-react';
import type { CustomizationOptionsInput } from '@/lib/schemas'; // Import the type

interface QrCustomizeAndActionProps {
  qrValue: string;
  options: CustomizationOptionsInput; // Type for options
  // onOptionsChange is removed as customization is no longer done here
  onDownload: () => void;
  onGoToEditor: () => void;
  onBack: () => void;
  isLoadingAppLogo?: boolean; // Optional prop to indicate if app logo is loading
}

export default function QrCustomizeAndAction({
  qrValue,
  options,
  onDownload,
  onGoToEditor,
  onBack,
  isLoadingAppLogo,
}: QrCustomizeAndActionProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-center items-start"> {/* Centering the preview */}
        <div className="space-y-6 w-full max-w-xs sm:max-w-sm md:max-w-md"> {/* Responsive max-width for preview */}
          {isLoadingAppLogo ? (
            <div className="flex flex-col items-center justify-center h-[256px] w-[256px] bg-muted rounded-lg mx-auto">
              <p className="text-sm text-muted-foreground">Generating preview...</p>
            </div>
          ) : (
            <QrCodePreview
              value={qrValue}
              size={options.size}
              fgColor={options.fgColor}
              bgColor={options.bgColor}
              level={options.level}
              includeMargin={options.margin}
              imageSettings={
                options.imageSrc && options.imageDisplaySize && options.size
                  ? {
                      src: options.imageSrc,
                      height: Math.floor((options.size * options.imageDisplaySize) / 100),
                      width: Math.floor((options.size * options.imageDisplaySize) / 100),
                      excavate: !!options.imageExcavate,
                    }
                  : undefined
              }
            />
          )}
        </div>
        {/* CustomizationPanel is removed */}
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Want More Options?</AlertTitle>
        <AlertDescription>
          Need to use your own logo, try different colors, or explore advanced styling? 
          Head to our <span className="font-semibold">Advanced Editor</span> for full control!
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
