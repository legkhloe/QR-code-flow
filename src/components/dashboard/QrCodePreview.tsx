
"use client";

import QRCodeStyling from 'qrcode.react'; // Using qrcode.react
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useRef, forwardRef, useImperativeHandle } from 'react';

// Define the structure for imageSettings, matching qrcode.react's expectation
interface ImageSettings {
  src: string;
  height: number;
  width: number;
  excavate: boolean;
  x?: number;
  y?: number;
}

interface QrCodePreviewProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  imageSettings?: ImageSettings; // New prop for image embedding
}

export interface QrCodePreviewHandles {
  downloadQRCode: (format: 'png' | 'jpeg' | 'svg') => void;
}

const QrCodePreview = forwardRef<QrCodePreviewHandles, QrCodePreviewProps>(({
  value,
  size = 256,
  fgColor = '#E0E0E0', 
  bgColor = '#1E1E1E', 
  level = 'M',
  includeMargin = true,
  imageSettings, 
}, ref) => {
  const qrCanvasRef = useRef<HTMLDivElement>(null); // For canvas element
  const qrSvgRef = useRef<HTMLDivElement>(null); // For SVG element

  useImperativeHandle(ref, () => ({
    downloadQRCode: (format: 'png' | 'jpeg' | 'svg') => {
      if (format === 'svg') {
        if (qrSvgRef.current) {
          const svgElement = qrSvgRef.current.querySelector('svg');
          if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'qrcode.svg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }
      } else { // PNG or JPEG
        if (qrCanvasRef.current) {
          const canvas = qrCanvasRef.current.querySelector('canvas');
          if (canvas) {
            const imageURL = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg');
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = `qrcode.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      }
    }
  }));

  const qrProps = {
    value,
    size,
    fgColor,
    bgColor,
    level,
    includeMargin,
    imageSettings: imageSettings?.src ? imageSettings : undefined, // Only pass if src is present
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle>QR Code Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        {/* Canvas rendering for display and PNG/JPEG download */}
        <div ref={qrCanvasRef} className="p-2 bg-card rounded-lg inline-block" style={{ background: bgColor }}>
          <QRCodeStyling
            {...qrProps}
            renderAs="canvas"
          />
        </div>
        {/* Hidden SVG for SVG download logic */}
        <div ref={qrSvgRef} style={{ display: 'none' }}>
          <QRCodeStyling
            {...qrProps}
            renderAs="svg"
          />
        </div>
        {/* Download buttons are now removed from here, handled by DownloadDropdown in parent */}
      </CardContent>
    </Card>
  );
});

QrCodePreview.displayName = 'QrCodePreview';
export default QrCodePreview;
