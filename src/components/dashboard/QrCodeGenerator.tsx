
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QrContentSchema, type QrContentInput, type CustomizationOptionsInput, CustomizationOptionsSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import QrCodePreview, { type QrCodePreviewHandles } from './QrCodePreview';
import CustomizationPanel from './CustomizationPanel';
import AiSuggestions from './AiSuggestions';
import EditorLeftSidebar, { type EditorTab } from './EditorLeftSidebar';
import DownloadDropdown from './DownloadDropdown';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info, Image as ImageIcon } from 'lucide-react';

const defaultCustomization: CustomizationOptionsInput = {
  fgColor: '#E0E0E0',
  bgColor: '#1E1E1E',
  level: 'M',
  size: 256,
  margin: true,
  imageSrc: '',
  imageDisplaySize: 20, // Default 20% of QR code size
  imageExcavate: true,
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
    const imageSrc = searchParams.get('imageSrc');
    const imageDisplaySize = searchParams.get('imageDisplaySize');
    const imageExcavate = searchParams.get('imageExcavate');


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
    if (imageSrc) newCustomization.imageSrc = imageSrc;
    if (imageDisplaySize && !isNaN(parseInt(imageDisplaySize))) newCustomization.imageDisplaySize = parseInt(imageDisplaySize);
    if (imageExcavate !== null) newCustomization.imageExcavate = imageExcavate === 'true';
    
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
      // Clear QR value if textarea is empty, revert to placeholder
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
    // No need to call setQrValue here, the useEffect on watchContent will handle it
    toast({
      title: "Content Updated",
      description: "QR code content set from AI suggestion.",
    });
  };

  const handleDownloadAction = (format: 'png' | 'jpeg' | 'svg') => {
    qrPreviewRef.current?.downloadQRCode(format);
  };
  
  const editorPreviewSize = Math.max(128, Math.min(customization.size || 256, 384));

  const imageSettingsForPreview = () => {
    if (customization.imageSrc && customization.imageDisplaySize && customization.size) {
      const imageSizePx = Math.floor((customization.size * customization.imageDisplaySize) / 100);
      return {
        src: customization.imageSrc,
        height: imageSizePx,
        width: imageSizePx,
        excavate: !!customization.imageExcavate, 
      };
    }
    return undefined;
  };


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

  const ElementsPanel = () => ( // This now contains the basic customization
    <CustomizationPanel options={customization} onOptionsChange={handleCustomizationChange} />
  );

  const MediaPanel = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="mr-2 h-5 w-5 text-primary" />
          Media &amp; Logos
        </CardTitle>
        <CardDescription>Embed an image or logo into your QR code. Provide a direct URL to the image.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="imageSrc">Image URL</Label>
          <Input
            id="imageSrc"
            type="url"
            placeholder="https://example.com/logo.png"
            value={customization.imageSrc || ''}
            onChange={(e) => handleCustomizationChange({ imageSrc: e.target.value })}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">Must be a direct link to an image (e.g., .png, .jpg, .svg).</p>
        </div>
        
        <div>
          <Label htmlFor="imageDisplaySize">Image Size ({customization.imageDisplaySize || 20}%)</Label>
          <Slider
            id="imageDisplaySize"
            min={5}
            max={40} // Max 40% to avoid covering too much QR code
            step={1}
            value={[customization.imageDisplaySize || 20]}
            onValueChange={(value) => handleCustomizationChange({ imageDisplaySize: value[0] })}
            className="mt-1"
            disabled={!customization.imageSrc}
          />
           <p className="text-xs text-muted-foreground mt-1">Percentage of QR code width/height.</p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="imageExcavate"
            checked={!!customization.imageExcavate}
            onCheckedChange={(checked) => handleCustomizationChange({ imageExcavate: checked })}
            disabled={!customization.imageSrc}
          />
          <Label htmlFor="imageExcavate">Clear QR Behind Image (Excavate)</Label>
        </div>
         <Button 
            variant="outline"
            size="sm"
            onClick={() => handleCustomizationChange({ imageSrc: '', imageDisplaySize: 20, imageExcavate: true })}
            disabled={!customization.imageSrc}
            className="w-full"
          >
            Remove Image
        </Button>
      </CardContent>
    </Card>
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
            <div className="w-full max-w-md p-4 bg-card rounded-lg shadow-xl">
               <QrCodePreview
                ref={qrPreviewRef}
                value={qrValue}
                size={editorPreviewSize}
                fgColor={customization.fgColor}
                bgColor={customization.bgColor}
                level={customization.level}
                includeMargin={!!customization.margin}
                imageSettings={imageSettingsForPreview()}
              />
            </div>
          </div>

          <aside className="lg:col-span-3 xl:col-span-2 space-y-6 overflow-y-auto p-1">
            {activeTab === 'settings' && <SettingsPanel />}
            {activeTab === 'aiAssist' && <AiAssistPanel />}
            {activeTab === 'elements' && <ElementsPanel />}
            {activeTab === 'media' && <MediaPanel />}
            {activeTab === 'text' && <PlaceholderPanel title="Text Tools" description="Add and customize text overlays on your QR code." />}
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
