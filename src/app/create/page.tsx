
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QrTypeSelector from '@/components/create-qr/QrTypeSelector';
import QrDetailForm from '@/components/create-qr/QrDetailForm';
import QrCustomizeAndAction from '@/components/create-qr/QrCustomizeAndAction';
import type { QrType, CustomizationOptionsInput } from '@/lib/schemas';
import { generateQrValue } from '@/lib/qrUtils';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { appName } from '@/lib/config';

const STEPS = [
  { id: 1, name: 'Select Type', description: 'Choose the purpose of your QR code.' },
  { id: 2, name: 'Enter Details', description: 'Provide the content for your QR code.' },
  { id: 3, name: 'Customize & Finish', description: 'Adjust appearance and choose your next step.' },
];

export default function CreateQrPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [qrType, setQrType] = useState<QrType | null>(null);
  const [qrDetails, setQrDetails] = useState<any | null>(null); // Stores specific data for the chosen type
  const [qrValue, setQrValue] = useState<string>(''); // The actual string for QR code generation
  
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptionsInput>({
    fgColor: '#E0E0E0', // Light foreground for dark theme
    bgColor: '#1E1E1E', // Dark background for dark theme
    level: 'M',
    size: 256,
    margin: true,
  });

  const router = useRouter();

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
    setQrDetails(null); // Reset details when type changes
    handleNextStep();
  };

  const handleDetailsSubmit = (data: any) => {
    setQrDetails(data);
    const newQrValue = generateQrValue(qrType, data);
    setQrValue(newQrValue);
    handleNextStep();
  };

  const handleCustomizationChange = (newOptions: Partial<CustomizationOptionsInput>) => {
    setCustomizationOptions(prev => ({ ...prev, ...newOptions }));
  };

  const handleDownload = () => {
    const queryParams = new URLSearchParams({
      qrValue: qrValue,
      ...Object.fromEntries(Object.entries(customizationOptions).map(([key, value]) => [key, String(value)]))
    });
    router.push(`/download?${queryParams.toString()}`);
  };

  const handleGoToEditor = () => {
     const queryParams = new URLSearchParams({
      qrValue: qrValue,
      ...Object.fromEntries(Object.entries(customizationOptions).map(([key, value]) => [key, String(value)]))
    });
    router.push(`/dashboard?${queryParams.toString()}`);
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
              onOptionsChange={handleCustomizationChange}
              onDownload={handleDownload}
              onGoToEditor={handleGoToEditor}
              onBack={handlePrevStep}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
