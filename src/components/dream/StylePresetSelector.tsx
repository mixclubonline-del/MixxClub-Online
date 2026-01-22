import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const stylePresets = [
  { id: 'cinematic', name: 'Cinematic', description: 'Film quality, dramatic lighting' },
  { id: 'product', name: 'Product', description: 'Clean studio photography' },
  { id: 'portrait', name: 'Portrait', description: 'Soft lighting, professional' },
  { id: 'abstract', name: 'Abstract', description: 'Flowing shapes, vibrant colors' },
  { id: 'technical', name: 'Technical', description: 'Clean lines, schematics' },
  { id: 'gaming', name: 'Gaming', description: 'Game art, fantasy style' },
  { id: 'neon', name: 'Neon', description: 'Cyberpunk, glowing effects' },
];

interface StylePresetSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function StylePresetSelector({ value, onChange }: StylePresetSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Style preset (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-muted-foreground">No preset</span>
        </SelectItem>
        {stylePresets.map((preset) => (
          <SelectItem key={preset.id} value={preset.id}>
            <span className="flex flex-col">
              <span>{preset.name}</span>
              <span className="text-xs text-muted-foreground">{preset.description}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
