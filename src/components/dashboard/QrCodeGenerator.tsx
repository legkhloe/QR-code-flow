"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QrContentSchema, type QrContentInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import QrCodePreview from './QrCodePreview';
import CustomizationPanel, { type CustomizationOptions } from './CustomizationPanel';
import AiSuggestions from './AiSuggestions';
import { Separator } from '../ui/separator';

export default function QrCodeGenerator() {
  const [qrValue, setQrValue] = useState<string>("https://example.com");
  const [customization, setCustomization] = useState<CustomizationOptions>({
    fgColor: '#E0E0E0', // Light foreground for dark theme
    bgColor: '#1E1E1E', // Dark background for dark theme
    level: 'M',
    size: 256,
    margin: true,
  });
  const { toast } = useToast();

  const form = useForm<QrContentInput>({
    resolver: zodResolver(QrContentSchema),
    defaultValues: {
      content: qrValue,
    },
  });

  // Update QR value when form content changes
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

  const handleCustomizationChange = (newOptions: Partial<CustomizationOptions>) => {
    setCustomization(prev => ({ ...prev, ...newOptions }));
  };

  const handleAiSuggestionSelect = (suggestion: string) => {
    form.setValue('content', suggestion);
    setQrValue(suggestion); // Immediately update preview
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
            <CardTitle className="text-2xl">Create Your QR Code</CardTitle>
            <CardDescription>Enter the URL or text you want to encode in the QR code.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="qr-content">Content (URL or Text)</FormLabel>
                      <FormControl>
                        <Textarea
                          id="qr-content"
                          placeholder="e.g., https://yourwebsite.com or 'Hello World!'"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto">
                  Generate / Update QR Code
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
