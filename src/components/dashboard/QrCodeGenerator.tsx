
"use client";

import { useState, useEffect, useRef, type FormEvent } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  QrContentSchema, type QrContentInput, 
  type CustomizationOptionsInput, CustomizationOptionsSchema,
  type SavedQrConfig, SavedQrConfigArraySchema,
  type BrandKit, BrandKitArraySchema, type BrandKitCustomizationInput
} from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Info, ImageIcon, XCircle, Save, Trash2, Edit, QrCode as QrCodeIcon, FolderKanban, Award, Palette, Wand2, Loader2, Settings, Shapes, Bot, UploadCloud } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UseFormReturn } from 'react-hook-form';
import { generateLogoForQrCode, type GenerateLogoInput } from '@/ai/flows/generate-logo-flow';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const LOCAL_STORAGE_MY_QRS_KEY = 'qrCodeForgeMyQRs';
const LOCAL_STORAGE_BRAND_KITS_KEY = 'qrCodeForgeBrandKits';

const defaultCustomization: CustomizationOptionsInput = {
  fgColor: '#E0E0E0',
  bgColor: '#1E1E1E',
  level: 'M',
  size: 256,
  margin: true,
  imageSrc: '',
  imageDisplaySize: 20, 
  imageExcavate: false, 
};

interface SettingsPanelProps {
  form: UseFormReturn<QrContentInput>;
  onSubmitContent: (data: QrContentInput) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ form, onSubmitContent }) => (
  <Card className="h-full shadow-lg flex flex-col">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Settings className="mr-2 h-5 w-5 text-primary" />
        QR Code Content
      </CardTitle>
      <CardDescription>Enter the data for your QR code. This could be a URL, text, Wi-Fi credentials, etc.</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitContent)} className="space-y-4 h-full flex flex-col">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex-grow flex flex-col">
                <FormLabel htmlFor="qr-content-editor-panel" className="sr-only">Content</FormLabel>
                <FormControl className="flex-grow">
                  <Textarea
                    id="qr-content-editor-panel"
                    placeholder="e.g., https://yourwebsite.com or 'Hello World!'"
                    {...field}
                    className="text-base bg-input focus:bg-background h-full resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full mt-auto">
            Update QR Content
          </Button>
        </form>
      </Form>
    </CardContent>
  </Card>
);

interface AiAssistPanelProps {
  onSuggestionSelect: (suggestion: string) => void;
}
const AiAssistPanel: React.FC<AiAssistPanelProps> = ({ onSuggestionSelect }) => (
   <Card className="h-full shadow-lg">
    <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5 text-primary" />
          AI Content Assist
        </CardTitle>
      </CardHeader>
      <AiSuggestions onSuggestionSelect={onSuggestionSelect} />
   </Card>
);

interface ElementsPanelProps {
  options: CustomizationOptionsInput;
  onOptionsChange: (newOptions: Partial<CustomizationOptionsInput>) => void;
}
const ElementsPanel: React.FC<ElementsPanelProps> = ({ options, onOptionsChange }) => (
  <Card className="h-full shadow-lg">
     <CardHeader>
        <CardTitle className="flex items-center">
          <Shapes className="mr-2 h-5 w-5 text-primary" />
          Elements & Style
        </CardTitle>
        <CardDescription>Customize colors, error correction, size, and margins.</CardDescription>
      </CardHeader>
    <CustomizationPanel options={options} onOptionsChange={onOptionsChange} />
  </Card>
);

interface MediaPanelProps {
  customization: CustomizationOptionsInput;
  handleCustomizationChange: (newOptions: Partial<CustomizationOptionsInput>) => void;
  uploadedImagePreview: string | null;
  setUploadedImagePreview: (src: string | null) => void;
  handleImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleRemoveImage: () => void;
  toast: ({ title, description, variant }: { title: string; description?: string; variant?: "default" | "destructive" | null | undefined; }) => void;
}
const MediaPanel: React.FC<MediaPanelProps> = ({ 
  customization, 
  handleCustomizationChange, 
  uploadedImagePreview, 
  setUploadedImagePreview,
  handleImageUpload, 
  fileInputRef, 
  handleRemoveImage,
  toast,
}) => {
  const [aiLogoPrompt, setAiLogoPrompt] = useState('');
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

  const handleGenerateLogo = async (e: FormEvent) => {
    e.preventDefault();
    if (!aiLogoPrompt.trim()) {
      toast({ title: "Prompt needed", description: "Please enter a description for the logo.", variant: "default"});
      return;
    }
    setIsGeneratingLogo(true);
    try {
      const result = await generateLogoForQrCode({ textPrompt: aiLogoPrompt });
      if (result.imageDataUri) {
        handleCustomizationChange({ imageSrc: result.imageDataUri });
        setUploadedImagePreview(result.imageDataUri);
        toast({ title: "AI Logo Generated!", description: "The new logo has been embedded."});
      } else {
        throw new Error("AI did not return an image.");
      }
    } catch (error: any) {
      console.error("AI Logo Generation error:", error);
      toast({ title: "AI Logo Error", description: error.message || "Failed to generate logo.", variant: "destructive"});
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  return (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center">
        <ImageIcon className="mr-2 h-5 w-5 text-primary" />
        Media &amp; Logos
      </CardTitle>
      <CardDescription>Embed an image or logo. Upload one or generate with AI.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <Label htmlFor="imageUpload">Upload Image</Label>
        <Input
          id="imageUpload"
          type="file"
          accept="image/png, image/jpeg, image/svg+xml"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          disabled={isGeneratingLogo}
        />
         <p className="text-xs text-muted-foreground mt-1">Recommended: Square logos, PNG/SVG for transparency (max 1MB).</p>
      </div>

      {uploadedImagePreview && (
        <div className="space-y-4 pt-4 border-t mt-4 border-border">
            <div className="flex justify-between items-center">
                <Label>Image Preview:</Label>
                 <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    disabled={isGeneratingLogo}
                    className="text-xs"
                    >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Remove Image
                </Button>
            </div>
          <div className="relative w-24 h-24 border rounded-md overflow-hidden mx-auto bg-muted/20">
            <img src={uploadedImagePreview} alt="Uploaded Preview" className="object-contain w-full h-full" />
          </div>
          <div>
            <Label htmlFor="imageDisplaySize">Image Size ({customization.imageDisplaySize || 20}%)</Label>
            <Slider
              id="imageDisplaySize"
              min={5}
              max={40}
              step={1}
              value={[customization.imageDisplaySize || 20]}
              onValueChange={(value) => handleCustomizationChange({ imageDisplaySize: value[0] })}
              className="mt-1"
              disabled={isGeneratingLogo || !customization.imageSrc}
            />
             <p className="text-xs text-muted-foreground mt-1">Percentage of QR code width/height.</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="imageExcavate"
              checked={!!customization.imageExcavate}
              onCheckedChange={(checked) => handleCustomizationChange({ imageExcavate: checked })}
              disabled={isGeneratingLogo || !customization.imageSrc}
            />
            <Label htmlFor="imageExcavate">Clear QR Behind Image (Excavate)</Label>
          </div>
        </div>
      )}
      
      <Separator className="my-6" />

      <div>
        <form onSubmit={handleGenerateLogo} className="space-y-3">
          <Label htmlFor="aiLogoPrompt">Or Generate Logo with AI</Label>
          <Textarea
            id="aiLogoPrompt"
            placeholder="e.g., 'a simple blue flame icon', 'green leaf silhouette'"
            value={aiLogoPrompt}
            onChange={(e) => setAiLogoPrompt(e.target.value)}
            rows={2}
            disabled={isGeneratingLogo}
          />
          <Button type="submit" className="w-full" disabled={isGeneratingLogo}>
            {isGeneratingLogo ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate Logo
          </Button>
           <p className="text-xs text-muted-foreground mt-1">AI will attempt to generate a small, iconic logo.</p>
        </form>
      </div>
    </CardContent>
  </Card>
  );
};

interface MyQrsPanelProps {
  savedQrs: SavedQrConfig[];
  openSaveQrModal: (qrToEditConfig?: SavedQrConfig) => void;
  handleLoadQr: (id: string) => void;
  setQrToDeleteId: (id: string | null) => void;
  toast: ({ title, description, variant }: { title: string; description?: string; variant?: "default" | "destructive" | null | undefined; }) => void;
}
const MyQrsPanel: React.FC<MyQrsPanelProps> = ({ savedQrs, openSaveQrModal, handleLoadQr, setQrToDeleteId }) => (
  <Card className="shadow-lg h-full flex flex-col">
    <CardHeader>
      <CardTitle className="flex items-center">
        <FolderKanban className="mr-2 h-5 w-5 text-primary" />
        My Saved QR Codes
      </CardTitle>
      <CardDescription>Load, rename, or delete your previously saved QR code configurations.</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow overflow-hidden">
      {savedQrs.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center h-full">
          <QrCodeIcon className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">No Saved QRs Yet</p>
          <p className="text-sm">Click the "Save QR" button in the top bar to save your current design.</p>
        </div>
      ) : (
        <ScrollArea className="h-full pr-3"> 
          <div className="space-y-3">
            {savedQrs.map((qr) => (
              <div key={qr.id} className="p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-3 overflow-hidden">
                     <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div style={{ backgroundColor: qr.customization.fgColor }} className="w-4 h-4 rounded-sm border border-border"/>
                        <div style={{ backgroundColor: qr.customization.bgColor }} className="w-4 h-4 rounded-sm border border-border"/>
                     </div>
                     <div className="overflow-hidden">
                        <p className="font-semibold truncate text-sm" title={qr.name}>{qr.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Saved: {new Date(qr.createdAt).toLocaleDateString()}
                        </p>
                     </div>
                </div>
                <div className="flex space-x-1.5 flex-shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => openSaveQrModal(qr)} className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Edit Name & Update</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" onClick={() => handleLoadQr(qr.id)} className="h-8 w-8">
                        <UploadCloud className="h-4 w-4" /> {/* Changed icon for Load */}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Load QR</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setQrToDeleteId(qr.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>Delete QR</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </CardContent>
  </Card>
);

interface BrandingPanelProps {
  brandKits: BrandKit[];
  openSaveBrandKitModal: (kitToEdit?: BrandKit) => void;
  handleApplyBrandKit: (kitCustomization: BrandKitCustomizationInput) => void;
  setBrandKitToDeleteId: (id: string | null) => void;
  customization: CustomizationOptionsInput; 
  toast: ({ title, description, variant }: { title: string; description?: string; variant?: "default" | "destructive" | null | undefined; }) => void;
}
const BrandingPanel: React.FC<BrandingPanelProps> = ({ brandKits, openSaveBrandKitModal, handleApplyBrandKit, setBrandKitToDeleteId }) => (
  <Card className="shadow-lg h-full flex flex-col">
    <CardHeader>
      <CardTitle className="flex items-center">
        <Award className="mr-2 h-5 w-5 text-primary" />
        Brand Kits
      </CardTitle>
      <CardDescription>Save and apply consistent branding to your QR codes. Does not include QR content or size.</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow overflow-hidden flex flex-col space-y-4">
      <Button onClick={() => openSaveBrandKitModal()} className="w-full">
        <Save className="mr-2 h-4 w-4" /> Save Current Style as Brand Kit
      </Button>
      {brandKits.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center h-full">
          <Palette className="mx-auto h-16 w-16 mb-4 opacity-30" />
           <p className="text-lg font-medium">No Brand Kits Yet</p>
          <p className="text-sm">Customize your QR's appearance and save it as a new kit.</p>
        </div>
      ) : (
        <ScrollArea className="h-full flex-grow pr-3">
          <div className="space-y-3">
            {brandKits.map((kit) => (
              <div key={kit.id} className="p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-3 overflow-hidden">
                     <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div style={{ backgroundColor: kit.customization.fgColor }} className="w-4 h-4 rounded-sm border border-border"/>
                      <div style={{ backgroundColor: kit.customization.bgColor }} className="w-4 h-4 rounded-sm border border-border"/>
                     </div>
                     <div className="overflow-hidden">
                        <p className="font-semibold truncate text-sm" title={kit.name}>{kit.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(kit.createdAt).toLocaleDateString()}
                        </p>
                     </div>
                </div>
                <div className="flex space-x-1.5 flex-shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => openSaveBrandKitModal(kit)} className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Edit Kit Name & Update</p></TooltipContent>
                  </Tooltip>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => handleApplyBrandKit(kit.customization)} className="h-8 w-8">
                        <Wand2 className="h-4 w-4 text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Apply Kit</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setBrandKitToDeleteId(kit.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>Delete Kit</p></TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </CardContent>
  </Card>
);

interface PlaceholderPanelProps {
  title: string;
  description: string;
  icon?: React.ElementType;
}
const PlaceholderPanel: React.FC<PlaceholderPanelProps> = ({ title, description, icon: Icon }) => (
  <Card className="h-full shadow-lg flex flex-col">
    <CardHeader>
      <CardTitle className="flex items-center">
       {Icon && <Icon className="mr-2 h-5 w-5 text-primary" />}
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow flex items-center justify-center">
      <Alert variant="default" className="bg-muted/50 w-full max-w-md">
        <Info className="h-4 w-4" />
        <AlertTitle>Coming Soon!</AlertTitle>
        <AlertDescription>
          This feature is currently under development. Check back later for more options!
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
);


export default function QrCodeGenerator() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const qrPreviewRef = useRef<QrCodePreviewHandles>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [qrValue, setQrValue] = useState<string>("https://example.com");
  const [customization, setCustomization] = useState<CustomizationOptionsInput>(defaultCustomization);
  const [activeTab, setActiveTab] = useState<EditorTab>('settings');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  
  const [savedQrs, setSavedQrs] = useState<SavedQrConfig[]>([]);
  const [isSaveQrModalOpen, setIsSaveQrModalOpen] = useState(false);
  const [newQrName, setNewQrName] = useState('');
  const [qrToEdit, setQrToEdit] = useState<SavedQrConfig | null>(null);
  const [qrToDeleteId, setQrToDeleteId] = useState<string | null>(null);

  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [isSaveBrandKitModalOpen, setIsSaveBrandKitModalOpen] = useState(false);
  const [newBrandKitName, setNewBrandKitName] = useState('');
  const [brandKitToEdit, setBrandKitToEdit] = useState<BrandKit | null>(null);
  const [brandKitToDeleteId, setBrandKitToDeleteId] = useState<string | null>(null);


  const form = useForm<QrContentInput>({
    resolver: zodResolver(QrContentSchema),
    defaultValues: {
      content: qrValue,
    },
  });

  useEffect(() => {
    try {
      const storedQrs = localStorage.getItem(LOCAL_STORAGE_MY_QRS_KEY);
      if (storedQrs) {
        const parsedQrs = JSON.parse(storedQrs);
        const validationResult = SavedQrConfigArraySchema.safeParse(parsedQrs);
        if (validationResult.success) {
          setSavedQrs(validationResult.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
          console.warn("Invalid My QRs data in localStorage, clearing.", validationResult.error);
          localStorage.removeItem(LOCAL_STORAGE_MY_QRS_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load My QRs from localStorage:", error);
    }

    try {
      const storedBrandKits = localStorage.getItem(LOCAL_STORAGE_BRAND_KITS_KEY);
      if (storedBrandKits) {
        const parsedKits = JSON.parse(storedBrandKits);
        const validationResult = BrandKitArraySchema.safeParse(parsedKits);
        if (validationResult.success) {
          setBrandKits(validationResult.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
          console.warn("Invalid Brand Kits data in localStorage, clearing.", validationResult.error);
          localStorage.removeItem(LOCAL_STORAGE_BRAND_KITS_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load Brand Kits from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    const initialQrValue = searchParams.get('qrValue');
    const fgColor = searchParams.get('fgColor');
    const bgColor = searchParams.get('bgColor');
    const level = searchParams.get('level') as CustomizationOptionsInput['level'] | null;
    const size = searchParams.get('size');
    const margin = searchParams.get('margin');
    const imageSrcParam = searchParams.get('imageSrc');
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
    
    if (imageSrcParam) {
      newCustomization.imageSrc = imageSrcParam;
      // Only set preview if it's a data URI, external URLs might not be safe/reliable for direct preview
      if (imageSrcParam.startsWith('data:image/')) { 
        setUploadedImagePreview(imageSrcParam);
      }
    }
    if (imageDisplaySize && !isNaN(parseInt(imageDisplaySize))) newCustomization.imageDisplaySize = parseInt(imageDisplaySize);
    if (imageExcavate !== null) {
        newCustomization.imageExcavate = imageExcavate === 'true';
    } else if (newCustomization.imageSrc) { 
        newCustomization.imageExcavate = defaultCustomization.imageExcavate;
    }
    
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
    // Only update qrValue if content is valid and different
    if (form.formState.isDirty && form.formState.isValid && watchContent && watchContent !== qrValue) {
      if (QrContentSchema.safeParse({ content: watchContent }).success) {
        setQrValue(watchContent);
      }
    }
  }, [watchContent, qrValue, form.formState.isDirty, form.formState.isValid, form]);


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
    form.setValue('content', suggestion, { shouldValidate: true, shouldDirty: true });
    // Trigger reactive update for qrValue immediately if content is valid.
    if (QrContentSchema.safeParse({ content: suggestion }).success) {
        setQrValue(suggestion);
    }
    toast({
      title: "Content Updated",
      description: "QR code content set from AI suggestion.",
    });
  };

  const handleDownloadAction = (format: 'png' | 'jpeg' | 'svg') => {
    qrPreviewRef.current?.downloadQRCode(format);
  };
  
  // Make preview size responsive to editor panel, but capped
  const editorPreviewSize = Math.max(128, Math.min(customization.size || 256, 420));


  const imageSettingsForPreview = () => {
    if (customization.imageSrc && customization.imageDisplaySize && customization.size) {
      // Calculate image size based on the *actual current QR size* for preview
      const imageActualSizePx = Math.floor((editorPreviewSize * customization.imageDisplaySize) / 100);
      return {
        src: customization.imageSrc,
        height: imageActualSizePx,
        width: imageActualSizePx,
        excavate: !!customization.imageExcavate, 
      };
    }
    return undefined;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., PNG, JPG, SVG).",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({
          title: "File Too Large",
          description: "Image size should not exceed 1MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        handleCustomizationChange({ imageSrc: dataUri });
        setUploadedImagePreview(dataUri);
        toast({
          title: "Image Loaded",
          description: "Your image has been embedded.",
        });
      };
      reader.onerror = () => {
        toast({
          title: "Image Load Error",
          description: "Could not load the image. Please try again.",
          variant: "destructive",
        });
        setUploadedImagePreview(null);
        handleCustomizationChange({ imageSrc: '' });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const handleRemoveImage = () => {
    handleCustomizationChange({ imageSrc: '', imageDisplaySize: defaultCustomization.imageDisplaySize, imageExcavate: defaultCustomization.imageExcavate });
    setUploadedImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({
      title: "Image Removed",
      description: "The embedded image has been cleared.",
    });
  };

  const openSaveQrModal = (qrToEditConfig?: SavedQrConfig) => {
    if (qrToEditConfig) {
      setQrToEdit(qrToEditConfig);
      setNewQrName(qrToEditConfig.name);
    } else {
      setQrToEdit(null);
      const proposedName = qrValue.substring(0, 30).replace(/^https?:\/\//, '');
      setNewQrName(proposedName || `QR Code ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }
    setIsSaveQrModalOpen(true);
  };

  const handleSaveQrConfig = () => {
    if (!newQrName.trim()) {
      toast({ title: "Name Required", description: "QR Code name cannot be empty.", variant: "destructive" });
      return;
    }

    let updatedQrs: SavedQrConfig[];
    if (qrToEdit) { 
      updatedQrs = savedQrs.map(qr => 
        qr.id === qrToEdit.id ? { ...qr, name: newQrName.trim(), qrValue: qrValue, customization: customization, createdAt: new Date().toISOString() } : qr
      );
      toast({ title: "QR Updated", description: `"${newQrName.trim()}" has been updated.` });
    } else { 
      const newSavedQr: SavedQrConfig = {
        id: Date.now().toString(),
        name: newQrName.trim(),
        qrValue: qrValue,
        customization: customization,
        createdAt: new Date().toISOString(),
      };
      // Add to the beginning of the array
      updatedQrs = [newSavedQr, ...savedQrs];
      toast({ title: "QR Saved", description: `"${newSavedQr.name}" has been saved.` });
    }
    
    setSavedQrs(updatedQrs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    localStorage.setItem(LOCAL_STORAGE_MY_QRS_KEY, JSON.stringify(updatedQrs));
    setIsSaveQrModalOpen(false);
    setNewQrName('');
    setQrToEdit(null);
  };

  const handleLoadQr = (id: string) => {
    const qrToLoad = savedQrs.find(qr => qr.id === id);
    if (qrToLoad) {
      setQrValue(qrToLoad.qrValue);
      form.setValue('content', qrToLoad.qrValue, { shouldValidate: true, shouldDirty: true });
      setCustomization(qrToLoad.customization);
      if (qrToLoad.customization.imageSrc) {
        setUploadedImagePreview(qrToLoad.customization.imageSrc);
      } else {
        setUploadedImagePreview(null);
      }
      setActiveTab('settings'); 
      toast({ title: "QR Loaded", description: `"${qrToLoad.name}" loaded into editor.` });
    }
  };
  
  const handleDeleteQr = () => {
    if (!qrToDeleteId) return;
    const qrName = savedQrs.find(qr => qr.id === qrToDeleteId)?.name || "Selected QR";
    const updatedQrs = savedQrs.filter(qr => qr.id !== qrToDeleteId);
    setSavedQrs(updatedQrs);
    localStorage.setItem(LOCAL_STORAGE_MY_QRS_KEY, JSON.stringify(updatedQrs));
    toast({ title: "QR Deleted", description: `"${qrName}" has been removed.` });
    setQrToDeleteId(null); 
  };

  const openSaveBrandKitModal = (kitToEdit?: BrandKit) => {
    if (kitToEdit) {
      setBrandKitToEdit(kitToEdit);
      setNewBrandKitName(kitToEdit.name);
    } else {
      setBrandKitToEdit(null);
      setNewBrandKitName(`Brand Kit ${brandKits.length + 1}`);
    }
    setIsSaveBrandKitModalOpen(true);
  };

  const handleSaveBrandKit = () => {
    if (!newBrandKitName.trim()) {
      toast({ title: "Name Required", description: "Brand kit name cannot be empty.", variant: "destructive" });
      return;
    }
    const { size, ...brandKitCustomizationData } = customization; 
    const completeBrandKitCustomization: BrandKitCustomizationInput = {
        fgColor: brandKitCustomizationData.fgColor || defaultCustomization.fgColor,
        bgColor: brandKitCustomizationData.bgColor || defaultCustomization.bgColor,
        level: brandKitCustomizationData.level || defaultCustomization.level,
        margin: brandKitCustomizationData.margin !== undefined ? brandKitCustomizationData.margin : defaultCustomization.margin,
        imageSrc: brandKitCustomizationData.imageSrc || defaultCustomization.imageSrc,
        imageDisplaySize: brandKitCustomizationData.imageDisplaySize || defaultCustomization.imageDisplaySize,
        imageExcavate: brandKitCustomizationData.imageExcavate !== undefined ? brandKitCustomizationData.imageExcavate : defaultCustomization.imageExcavate,
    };

    let updatedKits: BrandKit[];
    if (brandKitToEdit) {
      updatedKits = brandKits.map(kit =>
        kit.id === brandKitToEdit.id ? { ...kit, name: newBrandKitName.trim(), customization: completeBrandKitCustomization, createdAt: new Date().toISOString() } : kit
      );
      toast({ title: "Brand Kit Updated", description: `"${newBrandKitName.trim()}" has been updated.` });
    } else {
      const newKit: BrandKit = {
        id: Date.now().toString(),
        name: newBrandKitName.trim(),
        customization: completeBrandKitCustomization,
        createdAt: new Date().toISOString(),
      };
      updatedKits = [newKit, ...brandKits];
      toast({ title: "Brand Kit Saved", description: `"${newKit.name}" has been saved.` });
    }

    setBrandKits(updatedKits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    localStorage.setItem(LOCAL_STORAGE_BRAND_KITS_KEY, JSON.stringify(updatedKits));
    setIsSaveBrandKitModalOpen(false);
    setNewBrandKitName('');
    setBrandKitToEdit(null);
  };

  const handleApplyBrandKit = (kitCustomization: BrandKitCustomizationInput) => {
    const kitName = brandKits.find(kit => kit.customization === kitCustomization)?.name || "Selected kit";
    setCustomization(prev => ({
      ...prev, 
      ...kitCustomization 
    }));
    if (kitCustomization.imageSrc) {
      setUploadedImagePreview(kitCustomization.imageSrc);
    } else {
      setUploadedImagePreview(null);
    }
    toast({ title: "Brand Kit Applied", description: `Styles from "${kitName}" applied.` });
  };

  const handleDeleteBrandKit = () => {
    if (!brandKitToDeleteId) return;
    const kitName = brandKits.find(kit => kit.id === brandKitToDeleteId)?.name || "Selected kit";
    const updatedKits = brandKits.filter(kit => kit.id !== brandKitToDeleteId);
    setBrandKits(updatedKits);
    localStorage.setItem(LOCAL_STORAGE_BRAND_KITS_KEY, JSON.stringify(updatedKits));
    toast({ title: "Brand Kit Deleted", description: `"${kitName}" has been removed.` });
    setBrandKitToDeleteId(null); 
  };


  return (
    <TooltipProvider>
    <div className="flex flex-1 w-full h-full bg-background">
      <EditorLeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <h1 className="text-xl font-semibold">QR Code Editor</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => openSaveQrModal()}>
              <Save className="mr-2 h-4 w-4" /> Save QR
            </Button>
            <DownloadDropdown onDownload={handleDownloadAction} />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-7 gap-4 p-4 overflow-hidden"> {/* Changed to overflow-hidden, scroll on sub-panels */}
          
          <div className="lg:col-span-4 xl:col-span-5 bg-muted/20 p-4 md:p-6 rounded-lg flex flex-col items-center justify-center shadow-inner relative overflow-auto">
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

          <aside className="lg:col-span-3 xl:col-span-2 flex flex-col overflow-hidden"> {/* Changed to flex flex-col */}
            <ScrollArea className="flex-grow p-1"> {/* ScrollArea wraps the conditional panels */}
            {activeTab === 'settings' && <SettingsPanel form={form} onSubmitContent={onSubmitContent} />}
            {activeTab === 'aiAssist' && <AiAssistPanel onSuggestionSelect={handleAiSuggestionSelect} />}
            {activeTab === 'elements' && <ElementsPanel options={customization} onOptionsChange={handleCustomizationChange} />}
            {activeTab === 'media' && 
              <MediaPanel 
                customization={customization} 
                handleCustomizationChange={handleCustomizationChange}
                uploadedImagePreview={uploadedImagePreview}
                setUploadedImagePreview={setUploadedImagePreview}
                handleImageUpload={handleImageUpload}
                fileInputRef={fileInputRef}
                handleRemoveImage={handleRemoveImage}
                toast={toast}
              />
            }
            {activeTab === 'myQrs' && 
              <MyQrsPanel 
                savedQrs={savedQrs} 
                openSaveQrModal={openSaveQrModal} 
                handleLoadQr={handleLoadQr} 
                setQrToDeleteId={setQrToDeleteId} 
                toast={toast} 
              />
            }
            {activeTab === 'branding' && 
              <BrandingPanel 
                brandKits={brandKits} 
                openSaveBrandKitModal={openSaveBrandKitModal} 
                handleApplyBrandKit={handleApplyBrandKit} 
                setBrandKitToDeleteId={setBrandKitToDeleteId}
                customization={customization}
                toast={toast}
              />
            }
            {activeTab === 'text' && <PlaceholderPanel title="Text Tools" description="Add and customize text overlays on your QR code." icon={Edit} />}
            {activeTab === 'uploads' && <PlaceholderPanel title="My Uploads" description="Manage your uploaded assets." icon={UploadCloud}/>}
            {activeTab === 'advanced' && <PlaceholderPanel title="Advanced Settings" description="Fine-tune advanced QR code parameters." icon={Wand2} />}
            </ScrollArea>
          </aside>
        </div>
      </main>

      <Dialog open={isSaveQrModalOpen} onOpenChange={(isOpen) => { setIsSaveQrModalOpen(isOpen); if (!isOpen) { setQrToEdit(null); setNewQrName(''); }}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{qrToEdit ? "Edit & Update QR Code" : "Save QR Code Configuration"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="qrName">QR Code Name</Label>
            <Input 
              id="qrName" 
              value={newQrName} 
              onChange={(e) => setNewQrName(e.target.value)}
              placeholder="e.g., My Website Link"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveQrConfig}>{qrToEdit ? "Update" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!qrToDeleteId} onOpenChange={(open) => !open && setQrToDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete QR Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the QR configuration
              "{savedQrs.find(qr => qr.id === qrToDeleteId)?.name || 'this QR code'}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQrToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQr} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isSaveBrandKitModalOpen} onOpenChange={(isOpen) => { setIsSaveBrandKitModalOpen(isOpen); if (!isOpen) { setBrandKitToEdit(null); setNewBrandKitName(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{brandKitToEdit ? "Edit & Update Brand Kit" : "Save Brand Kit"}</DialogTitle>
            <CardDescription className="pt-2">Saves current colors, embedded image (if any), error correction level, and margin settings. QR content and size are not part of a brand kit.</CardDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="brandKitName">Brand Kit Name</Label>
            <Input 
              id="brandKitName" 
              value={newBrandKitName} 
              onChange={(e) => setNewBrandKitName(e.target.value)}
              placeholder="e.g., My Company Brand"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveBrandKit}>{brandKitToEdit ? "Update Kit" : "Save Kit"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!brandKitToDeleteId} onOpenChange={(open) => !open && setBrandKitToDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand Kit?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the brand kit
              "{brandKits.find(kit => kit.id === brandKitToDeleteId)?.name || 'this brand kit'}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBrandKitToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBrandKit} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
    </TooltipProvider>
  );
}

