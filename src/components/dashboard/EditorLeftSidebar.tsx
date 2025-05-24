
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Settings, 
  Bot, 
  Edit3, 
  Image as LucideImage, 
  Shapes, 
  UploadCloud,
  FolderKanban, 
  Award, 
  Wand2,
} from "lucide-react";

export type EditorTab = 
  | 'settings' 
  | 'aiAssist' 
  | 'text' 
  | 'media' 
  | 'elements' 
  | 'uploads' 
  | 'myQrs' 
  | 'branding'
  | 'advanced';

interface EditorLeftSidebarProps {
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
}

const toolsConfig: Array<{ id: EditorTab; label: string; icon: React.ElementType; section?: string }> = [
  // Core QR Functionality
  { id: 'settings', label: "Content", icon: Settings, section: "QR SETUP" },
  { id: 'elements', label: "Elements & Style", icon: Shapes, section: "QR SETUP" }, 
  { id: 'media', label: "Media & Logos", icon: LucideImage, section: "QR SETUP" },
  { id: 'aiAssist', label: "AI Assist", icon: Bot, section: "QR SETUP" },
  
  // Creative Tools (Placeholders for now)
  { id: 'text', label: "Text", icon: Edit3, section: "CREATIVE TOOLS" },
  { id: 'uploads', label: "Uploads", icon: UploadCloud, section: "CREATIVE TOOLS" },

  // Project Management
  { id: 'myQrs', label: "My QRs", icon: FolderKanban, section: "PROJECT" },
  { id: 'branding', label: "Branding", icon: Award, section: "PROJECT" },
  
  // Advanced (Placeholder)
  { id: 'advanced', label: "Advanced", icon: Wand2, section: "OTHER" },
];


export default function EditorLeftSidebar({ activeTab, setActiveTab }: EditorLeftSidebarProps) {
  const currentSections = Array.from(new Set(toolsConfig.map(tool => tool.section)));

  return (
    <aside className="w-20 lg:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      <ScrollArea className="flex-1">
        <nav className="p-2 lg:p-4 space-y-1">
          {currentSections.map(sectionName => (
            <div key={sectionName} className="space-y-1 mb-3">
              {sectionName && <p className="text-xs text-muted-foreground px-2 py-1 hidden lg:block uppercase tracking-wider">{sectionName}</p>}
              {toolsConfig.filter(tool => tool.section === sectionName).map((tool) => (
                <Button
                  key={tool.id}
                  variant={activeTab === tool.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start items-center text-sidebar-foreground mb-1",
                    activeTab === tool.id 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90" 
                      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => setActiveTab(tool.id)}
                  title={tool.label}
                >
                  <tool.icon className="h-5 w-5 mr-0 lg:mr-3 flex-shrink-0" />
                  <span className="hidden lg:inline truncate">{tool.label}</span>
                </Button>
              ))}
              {currentSections.indexOf(sectionName) < currentSections.length -1 && sectionName && <hr className="border-sidebar-border my-3 hidden lg:block"/>}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
