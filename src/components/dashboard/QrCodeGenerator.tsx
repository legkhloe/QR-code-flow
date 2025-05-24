
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  QrContentSchema, type QrContentInput, 
  type CustomizationOptionsInput, CustomizationOptionsSchema,
  type SavedQrConfig, SavedQrConfigArraySchema
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
import { Info, ImageIcon, XCircle, Save, Trash2, Edit, QrCode as QrCodeIcon, FolderKanban } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const LOCAL_STORAGE_KEY = 'qrCodeForgeMyQRs';

const defaultCustomization: CustomizationOptionsInput = {
  fgColor: '#E0E0E0',
  bgColor: '#1E1E1E',
  level: 'M',
  size: 256,
  margin: true,
  imageSrc: '',
  imageDisplaySize: 20, 
  imageExcavate: true,
};

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
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newQrName, setNewQrName] = useState('');
  const [qrToEdit, setQrToEdit] = useState<SavedQrConfig | null>(null); // For editing name

  const [qrToDeleteId, setQrToDeleteId] = useState<string | null>(null);


  const form = useForm<QrContentInput>({
    resolver: zodResolver(QrContentSchema),
    defaultValues: {
      content: qrValue,
    },
  });

  // Load saved QRs from localStorage on mount
  useEffect(() => {
    try {
      const storedQrs = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedQrs) {
        const parsedQrs = JSON.parse(storedQrs);
        const validationResult = SavedQrConfigArraySchema.safeParse(parsedQrs);
        if (validationResult.success) {
          setSavedQrs(validationResult.data);
        } else {
          console.warn("Invalid data in localStorage, clearing My QRs.", validationResult.error);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load QRs from localStorage:", error);
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
      if (imageSrcParam.startsWith('data:image/')) {
        setUploadedImagePreview(imageSrcParam);
      }
    }
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
      // setQrValue("https://example.com"); // Commented out to prevent overriding loaded QR value
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
    // setQrValue(suggestion); // This will be handled by watchContent effect
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
    handleCustomizationChange({ imageSrc: '', imageDisplaySize: 20, imageExcavate: true });
    setUploadedImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({
      title: "Image Removed",
      description: "The embedded image has been cleared.",
    });
  };

  const openSaveModal = (qrToEdit?: SavedQrConfig) => {
    if (qrToEdit) {
      setQrToEdit(qrToEdit);
      setNewQrName(qrToEdit.name);
    } else {
      setQrToEdit(null);
      setNewQrName(qrValue.substring(0, 30) || `QR Code ${new Date().toLocaleTimeString()}`);
    }
    setIsSaveModalOpen(true);
  };

  const handleSaveQrConfig = () => {
    if (!newQrName.trim()) {
      toast({ title: "Error", description: "QR Code name cannot be empty.", variant: "destructive" });
      return;
    }

    let updatedQrs: SavedQrConfig[];
    if (qrToEdit) { // Editing existing QR's name
      updatedQrs = savedQrs.map(qr => 
        qr.id === qrToEdit.id ? { ...qr, name: newQrName.trim() } : qr
      );
      toast({ title: "QR Renamed", description: `"${newQrName.trim()}" has been updated.` });
    } else { // Saving new QR
      const newSavedQr: SavedQrConfig = {
        id: Date.now().toString(),
        name: newQrName.trim(),
        qrValue: qrValue,
        customization: customization,
        createdAt: new Date().toISOString(),
      };
      updatedQrs = [...savedQrs, newSavedQr];
      toast({ title: "QR Saved", description: `"${newSavedQr.name}" has been saved to My QRs.` });
    }
    
    setSavedQrs(updatedQrs);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedQrs));
    setIsSaveModalOpen(false);
    setNewQrName('');
    setQrToEdit(null);
  };

  const handleLoadQr = (id: string) => {
    const qrToLoad = savedQrs.find(qr => qr.id === id);
    if (qrToLoad) {
      setQrValue(qrToLoad.qrValue);
      form.setValue('content', qrToLoad.qrValue);
      setCustomization(qrToLoad.customization);
      if (qrToLoad.customization.imageSrc) {
        setUploadedImagePreview(qrToLoad.customization.imageSrc);
      } else {
        setUploadedImagePreview(null);
      }
      setActiveTab('settings'); // Switch to settings tab to see content and allow customization
      toast({ title: "QR Loaded", description: `"${qrToLoad.name}" loaded into editor.` });
    }
  };
  
  const handleDeleteQr = () => {
    if (!qrToDeleteId) return;
    const updatedQrs = savedQrs.filter(qr => qr.id !== qrToDeleteId);
    setSavedQrs(updatedQrs);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedQrs));
    toast({ title: "QR Deleted", description: "The QR code has been deleted from My QRs." });
    setQrToDeleteId(null); // Close dialog by resetting the ID
  };


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
     <Card className="h-full shadow-lg">
        <AiSuggestions onSuggestionSelect={handleAiSuggestionSelect} />
     </Card>
  );

  const ElementsPanel = () => (
    <Card className="h-full shadow-lg">
      <CustomizationPanel options={customization} onOptionsChange={handleCustomizationChange} />
    </Card>
  );

  const MediaPanel = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="mr-2 h-5 w-5 text-primary" />
          Media &amp; Logos
        </CardTitle>
        <CardDescription>Embed an image or logo into your QR code. Upload an image file.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="imageUpload">Upload Image</Label>
          <Input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
           <p className="text-xs text-muted-foreground mt-1">Recommended: Square logos, PNG/SVG for best results. Max 1MB.</p>
        </div>

        {uploadedImagePreview && (
          <div className="space-y-2">
            <Label>Image Preview:</Label>
            <div className="relative w-24 h-24 border rounded-md overflow-hidden mx-auto bg-muted/20">
              <img src={uploadedImagePreview} alt="Uploaded Preview" className="object-contain w-full h-full" />
            </div>
          </div>
        )}
        
        {customization.imageSrc && (
          <>
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
              />
               <p className="text-xs text-muted-foreground mt-1">Percentage of QR code width/height.</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="imageExcavate"
                checked={!!customization.imageExcavate}
                onCheckedChange={(checked) => handleCustomizationChange({ imageExcavate: checked })}
              />
              <Label htmlFor="imageExcavate">Clear QR Behind Image (Excavate)</Label>
            </div>
            
            <Button 
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                className="w-full"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Remove Image
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );

  const MyQrsPanel = () => (
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
          <div className="text-center text-muted-foreground py-8">
            <QrCodeIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>You haven't saved any QR codes yet.</p>
            <p>Click the "Save QR" button in the top bar to save your current configuration.</p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-3"> {/* Adjust height as needed */}
            <ul className="space-y-3">
              {savedQrs.map((qr) => (
                <li key={qr.id} className="p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <QrCodeIcon className="h-6 w-6 text-primary flex-shrink-0" />
                       <div>
                          <p className="font-semibold truncate max-w-[150px] sm:max-w-[200px]">{qr.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Saved: {new Date(qr.createdAt).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                    <div className="flex space-x-1.5">
                      <Button variant="outline" size="sm" onClick={() => openSaveModal(qr)} title="Rename">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleLoadQr(qr.id)} title="Load">
                        Load
                      </Button>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => setQrToDeleteId(qr.id)} title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
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
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => openSaveModal()}>
              <Save className="mr-2 h-4 w-4" /> Save QR
            </Button>
            <DownloadDropdown onDownload={handleDownloadAction} />
          </div>
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
            {activeTab === 'myQrs' && <MyQrsPanel />}
            {activeTab === 'text' && <PlaceholderPanel title="Text Tools" description="Add and customize text overlays on your QR code." />}
            {activeTab === 'uploads' && <PlaceholderPanel title="Uploads" description="Manage your uploaded assets." />}
            {activeTab === 'branding' && <PlaceholderPanel title="Branding" description="Manage brand kits and assets." />}
            {activeTab === 'advanced' && <PlaceholderPanel title="Advanced Settings" description="Fine-tune advanced QR code parameters." />}
          </aside>
        </div>
      </main>

      {/* Save QR Dialog */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{qrToEdit ? "Rename QR Code" : "Save QR Code"}</DialogTitle>
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
              <Button variant="outline" onClick={() => { setQrToEdit(null); setNewQrName('');}}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveQrConfig}>{qrToEdit ? "Save Changes" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!qrToDeleteId} onOpenChange={(open) => !open && setQrToDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this QR code configuration from your saved list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQrToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQr}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
