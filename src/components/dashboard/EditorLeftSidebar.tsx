
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Search,
  FolderKanban,
  Award,
  UploadCloud,
  LayoutGrid,
  Image as LucideImage, // Renamed to avoid conflict with Next/Image
  Type,
  Shapes,
  Settings2,
  Palette,
  Bot,
} from "lucide-react";

const mainTools = [
  { icon: Search, label: "Search", action: () => console.log("Search clicked") },
  { icon: LayoutGrid, label: "Templates", action: () => console.log("Templates clicked") },
  { icon: Type, label: "Text", action: () => console.log("Text clicked") },
  { icon: LucideImage, label: "Media", action: () => console.log("Media clicked") },
  { icon: Shapes, label: "Elements", action: () => console.log("Elements clicked") },
  { icon: UploadCloud, label: "Uploads", action: () => console.log("Uploads clicked") },
];

const projectTools = [
  { icon: FolderKanban, label: "My QRs", action: () => console.log("My QRs clicked") },
  { icon: Award, label: "Branding", action: () => console.log("Branding clicked") },
];

const customizationTools = [
   { icon: Palette, label: "Appearance", action: () => console.log("Appearance clicked - (handled by right panel)") },
   { icon: Bot, label: "AI Assist", action: () => console.log("AI Assist clicked - (handled by right panel)") },
   { icon: Settings2, label: "Advanced", action: () => console.log("Advanced settings clicked") },
];


export default function EditorLeftSidebar() {
  // For now, actions are console logs. In a real app, these would trigger UI changes or navigation.
  return (
    <aside className="w-20 lg:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      <ScrollArea className="flex-1">
        <nav className="p-2 lg:p-4 space-y-3">
          {/* Main Tools */}
          <div>
            {mainTools.map((tool) => (
              <Button
                key={tool.label}
                variant="ghost"
                className="w-full justify-start items-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-1"
                onClick={tool.action}
                title={tool.label}
              >
                <tool.icon className="h-5 w-5 mr-0 lg:mr-3 flex-shrink-0" />
                <span className="hidden lg:inline truncate">{tool.label}</span>
              </Button>
            ))}
          </div>
          
          {/* Separator */}
          <hr className="border-sidebar-border my-3" />

          {/* Project/User Specific Tools */}
           <div>
            {projectTools.map((tool) => (
              <Button
                key={tool.label}
                variant="ghost"
                className="w-full justify-start items-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-1"
                onClick={tool.action}
                title={tool.label}
              >
                <tool.icon className="h-5 w-5 mr-0 lg:mr-3 flex-shrink-0" />
                <span className="hidden lg:inline truncate">{tool.label}</span>
              </Button>
            ))}
          </div>

          {/* Separator */}
          <hr className="border-sidebar-border my-3" />

          {/* Customization related (might be more conceptual for left bar) */}
           <div>
            <p className="text-xs text-muted-foreground px-2 py-1 hidden lg:block">QR SETTINGS</p>
            {customizationTools.map((tool) => (
              <Button
                key={tool.label}
                variant="ghost"
                className="w-full justify-start items-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-1"
                onClick={tool.action}
                title={tool.label}
              >
                <tool.icon className="h-5 w-5 mr-0 lg:mr-3 flex-shrink-0" />
                <span className="hidden lg:inline truncate">{tool.label}</span>
              </Button>
            ))}
          </div>
        </nav>
      </ScrollArea>
      {/* Footer could go here if needed */}
    </aside>
  );
}
