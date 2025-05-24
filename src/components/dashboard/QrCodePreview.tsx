"use client";

import QRCodeStyling from 'qrcode.react'; // Using qrcode.react
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { Button } from '../ui/button';
import React, { useRef } from 'react';

interface QrCodePreviewProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
}

const QrCodePreview: React.FC<QrCodePreviewProps> = ({
  value,
  size = 256,
  fgColor = '#E0E0E0', // Default foreground for dark theme
  bgColor = '#1E1E1E', // Default background for dark theme
  level = 'M',
  includeMargin = true,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = (format: 'png' | 'jpeg' | 'svg') => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector('canvas');
    const svgElement = qrRef.current.querySelector('svg');

    if (format === 'svg') {
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
    } else if (canvas) {
      const imageURL = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg');
      const link = document.createElement('a');
      link.href = imageURL;
      link.download = `qrcode.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>QR Code Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <div ref={qrRef} className="p-4 bg-card rounded-lg inline-block" style={{ background: bgColor }}>
          {/* We render both canvas (for PNG/JPEG) and SVG (for SVG download and display flexibility) */}
          {/* qrcode.react will render a canvas by default */}
          <QRCodeStyling
            value={value}
            size={size}
            fgColor={fgColor}
            bgColor={bgColor}
            level={level}
            includeMargin={includeMargin}
            renderAs="canvas" // For PNG/JPEG download
          />
          {/* Hidden SVG for SVG download logic */}
           <div style={{ display: 'none' }}>
            <QRCodeStyling
              value={value}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              level={level}
              includeMargin={includeMargin}
              renderAs="svg"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => downloadQRCode('png')} variant="outline">
            <Download className="mr-2 h-4 w-4" /> PNG
          </Button>
          <Button onClick={() => downloadQRCode('jpeg')} variant="outline">
            <Download className="mr-2 h-4 w-4" /> JPEG
          </Button>
           <Button onClick={() => downloadQRCode('svg')} variant="outline">
            <Download className="mr-2 h-4 w-4" /> SVG
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QrCodePreview;
