
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QrContentSchema, type QrContentInput, type CustomizationOptionsInput, CustomizationOptionsSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import QrCodePreview from './QrCodePreview';
import CustomizationPanel from './CustomizationPanel';
import AiSuggestions from './AiSuggestions';
import { Separator } from '../ui/separator';
import { useSearchParams } from 'next/navigation';

const defaultCustomization: CustomizationOptionsInput = {
  fgColor: '#E0E0E0',
  bgColor: '#1E1E1E',
  level: 'M',
  size: 256,
  margin: true,
};

export default function QrCodeGenerator() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [qrValue, setQrValue] = useState<string>("https://example.com");
  const [customization, setCustomization] = useState<CustomizationOptionsInput>(defaultCustomization);
  
  const form = useForm<QrContentInput>({
    resolver: zodResolver(QrContentSchema),
    defaultValues: {
      content: qrValue,
    },
  });

  useEffect(() => {
    const initialQrValue = searchParams.get('qrValue');
    const fgColor = searchParams.get('fgColor');
    const bgColor = searchParams.get('bgColor');
    const level = searchParams.get('level') as CustomizationOptionsInput['level'] | null;
    const size = searchParams.get('size');
    const margin = searchParams.get('margin');

    let loadedFromParams = false;

    if (initialQrValue) {
      setQrValue(initialQrValue);
      form.setValue('content', initialQrValue);
      loadedFromParams = true;
    }

    const newCustomization: Partial<CustomizationOptionsInput> = {};
    if (fgColor) newCustomization.fgColor = fgColor;
    if (bgColor) newCustomization.bgColor = bgColor;
    if (level && ['L', 'M', 'Q', 'H'].includes(level)) newCustomization.level = level;
    if (size && !isNaN(parseInt(size))) newCustomization.size = parseInt(size);
    if (margin !== null) newCustomization.margin = margin === 'true';
    
    if (Object.keys(newCustomization).length > 0) {
       try {
        const validatedInitialCustomization = CustomizationOptionsSchema.partial().parse(newCustomization);
        setCustomization(prev => ({ ...prev, ...validatedInitialCustomization }));
        loadedFromParams = true;
      } catch (error) {
        console.error("Invalid customization options from URL in editor:", error);
        toast({
          title: "Customization Load Error",
          description: "Some customization options from the URL were invalid and defaults were used.",
          variant: "destructive"
        });
      }
    }
    if (loadedFromParams) {
       toast({
        title: "QR Code Loaded",
        description: "Your QR code has been loaded into the editor.",
      });
    }

  }, [searchParams, form, toast]);


  const watchContent = form.watch('content');
  useEffect(() => {
    if (watchContent && watchContent !== qrValue) {
      setQrValue(watchContent);
    }
  }, [watchContent, qrValue]);

  const onSubmit = (data: QrContentInput) => {
    setQrValue(data.content);
    toast({
      title: "QR Code Updated",
      description: "Preview has been refreshed with new content.",
    });
  };

  const handleCustomizationChange = (newOptions: Partial<CustomizationOptionsInput>) => {
    setCustomization(prev => ({ ...prev, ...newOptions }));
  };

  const handleAiSuggestionSelect = (suggestion: string) => {
    form.setValue('content', suggestion);
    setQrValue(suggestion); 
    toast({
      title: "Content Updated",
      description: "QR code content set from AI suggestion.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Advanced QR Code Editor</CardTitle>
            <CardDescription>Fine-tune your QR code content and appearance.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="qr-content">Content (URL, Text, WiFi, vCard, etc.)</FormLabel>
                      <FormControl>
                        <Textarea
                          id="qr-content"
                          placeholder="e.g., https://yourwebsite.com or 'Hello World!' or WIFI:S:MyNet;T:WPA;P:MyPass;;"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  Update Preview
                </Button>
              </CardContent>
            </form>
          </Form>
        </Card>
        
        <Separator />
        
        <AiSuggestions onSuggestionSelect={handleAiSuggestionSelect} />
      </div>

      <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24">
        <QrCodePreview
          value={qrValue}
          size={customization.size}
          fgColor={customization.fgColor}
          bgColor={customization.bgColor}
          level={customization.level}
          includeMargin={customization.margin}
        />
        <CustomizationPanel options={customization} onOptionsChange={handleCustomizationChange} />
      </div>
    </div>
  );
}
