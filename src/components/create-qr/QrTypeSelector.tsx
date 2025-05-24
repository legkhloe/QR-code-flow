
"use client";

import type { QrType } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Type, Wifi, Mail, MessageSquare, UserSquare2 } from 'lucide-react'; // Replaced Contact with UserSquare2
import { cn } from '@/lib/utils';

interface QrTypeSelectorProps {
  onTypeSelect: (type: QrType) => void;
}

const qrTypesConfig = [
  { type: 'url' as QrType, label: 'URL', icon: Globe, description: 'Link to a website or online content.' },
  { type: 'text' as QrType, label: 'Text', icon: Type, description: 'Share plain text information.' },
  { type: 'wifi' as QrType, label: 'Wi-Fi', icon: Wifi, description: 'Share Wi-Fi network credentials.' },
  { type: 'email' as QrType, label: 'Email', icon: Mail, description: 'Compose an email quickly.' },
  { type: 'sms' as QrType, label: 'SMS', icon: MessageSquare, description: 'Send a pre-filled text message.' },
  { type: 'vcard' as QrType, label: 'Contact Card (vCard)', icon: UserSquare2, description: 'Share contact details easily.' },
];

export default function QrTypeSelector({ onTypeSelect }: QrTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {qrTypesConfig.map(({ type, label, icon: Icon, description }) => (
          <Card 
            key={type}
            onClick={() => onTypeSelect(type)}
            className="cursor-pointer hover:shadow-primary/30 transition-shadow duration-300 flex flex-col items-center text-center p-4"
          >
            <CardHeader className="p-2">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-3">
                <Icon className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg">{label}</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <CardDescription className="text-xs">{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
