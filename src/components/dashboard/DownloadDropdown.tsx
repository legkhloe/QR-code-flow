
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadDropdownProps {
  onDownload: (format: 'png' | 'jpeg' | 'svg') => void;
}

export default function DownloadDropdown({ onDownload }: DownloadDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Download Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDownload('png')}>
          <Download className="mr-2 h-4 w-4" />
          PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDownload('jpeg')}>
          <Download className="mr-2 h-4 w-4" />
          JPEG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDownload('svg')}>
          <Download className="mr-2 h-4 w-4" />
          SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
