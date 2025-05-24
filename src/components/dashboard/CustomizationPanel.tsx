"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export interface CustomizationOptions {
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  size: number;
  margin: boolean; // Simplified margin to on/off, qrcode.react uses includeMargin
}

interface CustomizationPanelProps {
  options: CustomizationOptions;
  onOptionsChange: (newOptions: Partial<CustomizationOptions>) => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ options, onOptionsChange }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Customize QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fgColor">Foreground Color</Label>
            <Input
              id="fgColor"
              type="color"
              value={options.fgColor}
              onChange={(e) => onOptionsChange({ fgColor: e.target.value })}
              className="h-10 p-1"
            />
          </div>
          <div>
            <Label htmlFor="bgColor">Background Color</Label>
            <Input
              id="bgColor"
              type="color"
              value={options.bgColor}
              onChange={(e) => onOptionsChange({ bgColor: e.target.value })}
              className="h-10 p-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="level">Error Correction Level</Label>
          <Select
            value={options.level}
            onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => onOptionsChange({ level: value })}
          >
            <SelectTrigger id="level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Low (L)</SelectItem>
              <SelectItem value="M">Medium (M)</SelectItem>
              <SelectItem value="Q">Quartile (Q)</SelectItem>
              <SelectItem value="H">High (H)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="size">Size ({options.size}px)</Label>
          <Slider
            id="size"
            min={64}
            max={1024}
            step={8}
            value={[options.size]}
            onValueChange={(value) => onOptionsChange({ size: value[0] })}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="margin"
            checked={options.margin}
            onCheckedChange={(checked) => onOptionsChange({ margin: checked })}
          />
          <Label htmlFor="margin">Include Margin</Label>
        </div>

      </CardContent>
    </Card>
  );
};

export default CustomizationPanel;
