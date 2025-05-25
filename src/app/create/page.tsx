
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QrTypeSelector from '@/components/create-qr/QrTypeSelector';
import QrDetailForm from '@/components/create-qr/QrDetailForm';
import QrCustomizeAndAction from '@/components/create-qr/QrCustomizeAndAction';
import type { QrType, CustomizationOptionsInput } from '@/lib/schemas';
import { generateQrValue } from '@/lib/qrUtils';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { appName } from '@/lib/config';
import { generateLogoForQrCode } from '@/ai/flows/generate-logo-flow'; // For app branding
import { useToast } from "@/hooks/use-toast";


const STEPS = [
  { id: 1, name: 'Select Type', description: 'Choose the purpose of your QR code.' },
  { id: 2, name: 'Enter Details', description: 'Provide the content for your QR code.' },
  { id: 3, name: 'Preview & Finish', description: 'Review your QR code and choose your next step.' }, // Updated description
];

// Default customization, fgColor/bgColor will be based on theme.
// imageSrc will be populated by the AI-generated app logo.
const initialCustomizationOptions: CustomizationOptionsInput = {
  fgColor: '#E0E0E0', // Default theme foreground for dark mode
  bgColor: '#1E1E1E', // Default theme background for dark mode
  level: 'M',
  size: 256,
  margin: true,
  imageSrc: '', // Placeholder for app logo
  imageDisplaySize: 18, // Size for app logo (percentage)
  imageExcavate: true,  // Excavate for branding
};

export default function CreateQrPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [qrType, setQrType] = useState<QrType | null>(null);
  const [qrDetails, setQrDetails] = useState<any | null>(null); 
  const [qrValue, setQrValue] = useState<string>(''); 
  
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptionsInput>(initialCustomizationOptions);
  const [appBrandingImageSrc, setAppBrandingImageSrc] = useState<string | null>(null);
  const [isLoadingAppLogo, setIsLoadingAppLogo] = useState<boolean>(true);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Attempt to generate app logo once on component mount for branding
    const generateAppBrandingLogo = async () => {
      setIsLoadingAppLogo(true);
      try {
        // Using a very specific prompt for a small, simple, iconic representation.
        // "QCF" is for "QR Code Forge". Requesting a lettermark for simplicity.
        const result = await generateLogoForQrCode({ textPrompt: "Minimalist QCF lettermark icon, monochrome" });
        if (result.imageDataUri) {
          setAppBrandingImageSrc(result.imageDataUri);
        } else {
          console.warn('App branding logo generation did not return an image.');
          // Optionally, use a fallback static placeholder if generation fails.
          // setAppBrandingImageSrc('/placeholder-logo.png'); 
        }
      } catch (error) {
        console.error('Failed to generate app branding logo:', error);
        toast({
          title: "Logo Generation Issue",
          description: "Could not generate app branding logo. Preview will proceed without it.",
          variant: "default" // Not destructive, as the QR itself is still usable
        });
      } finally {
        setIsLoadingAppLogo(false);
      }
    };
    generateAppBrandingLogo();
  }, [toast]); // Added toast to dependency array

  useEffect(() => {
    // Update customizationOptions with the app branding logo once it's generated
    if (appBrandingImageSrc) {
      setCustomizationOptions(prev => ({
        ...prev,
        imageSrc: appBrandingImageSrc,
        imageDisplaySize: initialCustomizationOptions.imageDisplaySize,
        imageExcavate: initialCustomizationOptions.imageExcavate,
      }));
    }
  }, [appBrandingImageSrc]);


  const handleNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTypeSelect = (type: QrType) => {
    setQrType(type);
    setQrDetails(null); 
    handleNextStep();
  };

  const handleDetailsSubmit = (data: any) => {
    setQrDetails(data);
    const newQrValue = generateQrValue(qrType, data);
    setQrValue(newQrValue);
    handleNextStep();
  };

  // handleCustomizationChange is no longer needed as customization is removed from step 3 UI
  // const handleCustomizationChange = (newOptions: Partial<CustomizationOptionsInput>) => {
  //   setCustomizationOptions(prev => ({ ...prev, ...newOptions }));
  // };

  const buildQueryParams = () => {
    const params = new URLSearchParams({
      qrValue: qrValue,
      fgColor: customizationOptions.fgColor,
      bgColor: customizationOptions.bgColor,
      level: customizationOptions.level,
      size: String(customizationOptions.size),
      margin: String(customizationOptions.margin),
    });
    // Include image settings if app logo was successfully generated and applied
    if (customizationOptions.imageSrc) {
      params.append('imageSrc', customizationOptions.imageSrc);
    }
    if (customizationOptions.imageDisplaySize) {
      params.append('imageDisplaySize', String(customizationOptions.imageDisplaySize));
    }
    if (customizationOptions.imageExcavate !== undefined) {
      params.append('imageExcavate', String(customizationOptions.imageExcavate));
    }
    return params.toString();
  }

  const handleDownload = () => {
    router.push(`/download?${buildQueryParams()}`);
  };

  const handleGoToEditor = () => {
    router.push(`/dashboard?${buildQueryParams()}`);
  };
  
  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Create Your QR Code with {appName}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          <Progress value={progressPercentage} className="w-full mt-2" />
           <p className="text-sm text-muted-foreground mt-1 text-center">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
          </p>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <QrTypeSelector onTypeSelect={handleTypeSelect} />
          )}
          {currentStep === 2 && qrType && (
            <QrDetailForm type={qrType} onSubmit={handleDetailsSubmit} onBack={handlePrevStep} />
          )}
          {currentStep === 3 && qrType && qrDetails && (
            <QrCustomizeAndAction
              qrValue={qrValue}
              options={customizationOptions}
              // onOptionsChange is removed
              onDownload={handleDownload}
              onGoToEditor={handleGoToEditor}
              onBack={handlePrevStep}
              isLoadingAppLogo={isLoadingAppLogo}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
