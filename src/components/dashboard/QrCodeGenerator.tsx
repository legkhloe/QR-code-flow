
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
import EditorLeftSidebar from './EditorLeftSidebar'; // New import
import { useSearchParams } from 'next/navigation';

const defaultCustomization: CustomizationOptionsInput = {
  fgColor: '#E0E0E0',
  bgColor: '#1E1E1E',
  level: 'M',
  size: 256, // Default internal size, preview component might cap it
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
    if (loadedFromParams && initialQrValue) { // Only toast if qrValue actually loaded
       toast({
        title: "QR Code Loaded",
        description: "Your QR code has been loaded into the editor.",
      });
    }

  }, [searchParams, form, toast]);


  const watchContent = form.watch('content');
  useEffect(() => {
    // Update QR value only if form content is valid and different
    if (form.formState.isValid && watchContent && watchContent !== qrValue) {
      setQrValue(watchContent);
    } else if (!watchContent && qrValue !== "https://example.com") { // Clear preview if content is empty
      setQrValue("https://example.com"); // or some placeholder
    }
  }, [watchContent, qrValue, form.formState.isValid]);

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
    form.setValue('content', suggestion, { shouldValidate: true }); // Ensure validation on AI suggestion
    setQrValue(suggestion); 
    toast({
      title: "Content Updated",
      description: "QR code content set from AI suggestion.",
    });
  };
  
  // Determine preview size, ensuring it's reasonable for the editor.
  // The QrCodePreview component itself might handle scaling for download.
  const editorPreviewSize = Math.max(128, Math.min(customization.size, 320));


  return (
    <div className="flex flex-1 w-full h-full bg-background"> {/* Outer container */}
      <EditorLeftSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top action bar */}
        <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <h1 className="text-xl font-semibold">QR Code Editor</h1>
          {/* Future global actions like Save/Load, Share could go here */}
        </div>

        {/* Content grid (Center canvas + Right properties) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-7 gap-4 p-4 overflow-y-auto">
          
          {/* Center Canvas Area */}
          <div className="lg:col-span-5 bg-muted/10 p-4 md:p-6 rounded-lg flex flex-col items-center justify-start space-y-6 shadow-inner">
            <Card className="w-full shadow-lg">
              <CardHeader>
                <CardTitle>QR Code Content</CardTitle>
                <CardDescription>Enter the data for your QR code. This could be a URL, text, Wi-Fi credentials (e.g., WIFI:S:MyNet;T:WPA;P:MyPass;;), vCard info, etc.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="qr-content-editor" className="sr-only">Content</FormLabel>
                          <FormControl>
                            <Textarea
                              id="qr-content-editor"
                              placeholder="e.g., https://yourwebsite.com or 'Hello World!'"
                              rows={4}
                              {...field}
                              className="text-base bg-input focus:bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full sm:w-auto">
                      Update Preview
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <div className="w-full flex justify-center items-center mt-4 p-4 bg-card rounded-md shadow-lg">
              <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                 <QrCodePreview
                  value={qrValue}
                  size={editorPreviewSize}
                  fgColor={customization.fgColor}
                  bgColor={customization.bgColor}
                  level={customization.level}
                  includeMargin={customization.margin}
                />
              </div>
            </div>
          </div>

          {/* Right Properties Panel */}
          <aside className="lg:col-span-2 space-y-6 overflow-y-auto p-1">
            <CustomizationPanel options={customization} onOptionsChange={handleCustomizationChange} />
            <AiSuggestions onSuggestionSelect={handleAiSuggestionSelect} />
          </aside>
        </div>
      </main>
    </div>
  );
}
