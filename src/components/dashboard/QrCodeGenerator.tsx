
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QrContentSchema, type QrContentInput, type CustomizationOptionsInput, CustomizationOptionsSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import QrCodePreview, { type QrCodePreviewHandles } from './QrCodePreview';
import CustomizationPanel from './CustomizationPanel';
import AiSuggestions from './AiSuggestions';
import EditorLeftSidebar, { type EditorTab } from './EditorLeftSidebar';
import DownloadDropdown from './DownloadDropdown';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

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
  const qrPreviewRef = useRef<QrCodePreviewHandles>(null);

  const [qrValue, setQrValue] = useState<string>("https://example.com");
  const [customization, setCustomization] = useState<CustomizationOptionsInput>(defaultCustomization);
  const [activeTab, setActiveTab] = useState<EditorTab>('settings');
  
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
    if (loadedFromParams && initialQrValue) {
       toast({
        title: "QR Code Loaded",
        description: "Your QR code has been loaded into the editor.",
      });
    }

  }, [searchParams, form, toast]);


  const watchContent = form.watch('content');
  useEffect(() => {
    if (form.formState.isValid && watchContent && watchContent !== qrValue) {
      setQrValue(watchContent);
    } else if (!watchContent && qrValue !== "https://example.com") {
      setQrValue("https://example.com");
    }
  }, [watchContent, qrValue, form.formState.isValid]);

  const onSubmitContent = (data: QrContentInput) => {
    setQrValue(data.content);
    toast({
      title: "QR Content Updated",
      description: "Preview has been refreshed with new content.",
    });
  };

  const handleCustomizationChange = (newOptions: Partial<CustomizationOptionsInput>) => {
    setCustomization(prev => ({ ...prev, ...newOptions }));
  };

  const handleAiSuggestionSelect = (suggestion: string) => {
    form.setValue('content', suggestion, { shouldValidate: true });
    setQrValue(suggestion); 
    toast({
      title: "Content Updated",
      description: "QR code content set from AI suggestion.",
    });
  };

  const handleDownloadAction = (format: 'png' | 'jpeg' | 'svg') => {
    qrPreviewRef.current?.downloadQRCode(format);
  };
  
  const editorPreviewSize = Math.max(128, Math.min(customization.size, 384)); // Increased max for better preview

  // Panels to be rendered in the right column
  const SettingsPanel = () => (
    <Card className="h-full shadow-lg">
      <CardHeader>
        <CardTitle>QR Code Content</CardTitle>
        <CardDescription>Enter the data for your QR code. This could be a URL, text, Wi-Fi credentials, etc.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitContent)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="qr-content-editor-panel" className="sr-only">Content</FormLabel>
                  <FormControl>
                    <Textarea
                      id="qr-content-editor-panel"
                      placeholder="e.g., https://yourwebsite.com or 'Hello World!'"
                      rows={6}
                      {...field}
                      className="text-base bg-input focus:bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Update QR Content
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const AiAssistPanel = () => (
    <AiSuggestions onSuggestionSelect={handleAiSuggestionSelect} />
  );

  const ElementsPanel = () => (
    <CustomizationPanel options={customization} onOptionsChange={handleCustomizationChange} />
  );

  const PlaceholderPanel = ({ title, description }: { title: string, description: string }) => (
    <Card className="h-full shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="bg-muted/50">
          <Info className="h-4 w-4" />
          <AlertTitle>Coming Soon!</AlertTitle>
          <AlertDescription>
            This feature is currently under development. Check back later for more options!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );


  return (
    <div className="flex flex-1 w-full h-full bg-background">
      <EditorLeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <h1 className="text-xl font-semibold">QR Code Editor</h1>
          <DownloadDropdown onDownload={handleDownloadAction} />
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-7 gap-4 p-4 overflow-y-auto">
          
          <div className="lg:col-span-4 xl:col-span-5 bg-muted/20 p-4 md:p-6 rounded-lg flex flex-col items-center justify-center shadow-inner relative">
            {/* This div will act as the "canvas" for the QR code */}
            <div className="w-full max-w-md p-4 bg-card rounded-lg shadow-xl">
               <QrCodePreview
                ref={qrPreviewRef}
                value={qrValue}
                size={editorPreviewSize}
                fgColor={customization.fgColor}
                bgColor={customization.bgColor}
                level={customization.level}
                includeMargin={customization.margin}
              />
            </div>
          </div>

          <aside className="lg:col-span-3 xl:col-span-2 space-y-6 overflow-y-auto p-1">
            {activeTab === 'settings' && <SettingsPanel />}
            {activeTab === 'aiAssist' && <AiAssistPanel />}
            {activeTab === 'elements' && <ElementsPanel />}
            {activeTab === 'text' && <PlaceholderPanel title="Text Tools" description="Add and customize text overlays on your QR code." />}
            {activeTab === 'media' && <PlaceholderPanel title="Media & Logos" description="Upload and manage images or logos to embed in your QR code." />}
            {activeTab === 'uploads' && <PlaceholderPanel title="Uploads" description="Manage your uploaded assets." />}
            {activeTab === 'myQrs' && <PlaceholderPanel title="My QRs" description="Browse and manage your saved QR codes." />}
            {activeTab === 'branding' && <PlaceholderPanel title="Branding" description="Manage brand kits and assets." />}
             {activeTab === 'advanced' && <PlaceholderPanel title="Advanced Settings" description="Fine-tune advanced QR code parameters." />}
          </aside>
        </div>
      </main>
    </div>
  );
}

    