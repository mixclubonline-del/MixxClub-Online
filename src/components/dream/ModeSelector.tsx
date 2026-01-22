import React from 'react';
import { Button } from '@/components/ui/button';
import { Image, Video, Music, Mic, Paintbrush } from 'lucide-react';
import type { DreamMode, DreamEngineCapabilities } from '@/hooks/useDreamEngine';

interface ModeSelectorProps {
  mode: DreamMode;
  onChange: (mode: DreamMode) => void;
  capabilities: DreamEngineCapabilities;
}

const modes: { id: DreamMode; label: string; icon: React.ReactNode; capKey: keyof DreamEngineCapabilities }[] = [
  { id: 'image', label: 'Image', icon: <Image className="w-4 h-4" />, capKey: 'image' },
  { id: 'video', label: 'Video', icon: <Video className="w-4 h-4" />, capKey: 'video' },
  { id: 'audio', label: 'Audio', icon: <Music className="w-4 h-4" />, capKey: 'audio' },
  { id: 'speech', label: 'Speech', icon: <Mic className="w-4 h-4" />, capKey: 'speech' },
  { id: 'image-edit', label: 'Edit', icon: <Paintbrush className="w-4 h-4" />, capKey: 'imageEdit' },
];

export function ModeSelector({ mode, onChange, capabilities }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
      {modes.map((m) => {
        const isAvailable = capabilities[m.capKey];
        return (
          <Button
            key={m.id}
            variant={mode === m.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onChange(m.id)}
            disabled={!isAvailable}
            className="gap-1.5"
            title={!isAvailable ? `${m.label} requires additional configuration` : m.label}
          >
            {m.icon}
            <span className="hidden sm:inline">{m.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
