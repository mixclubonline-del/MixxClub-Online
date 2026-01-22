import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Video, Music, Mic } from 'lucide-react';
import type { DreamMode } from '@/hooks/useDreamEngine';

interface PromptCardProps {
  id: string;
  name: string;
  prompt: string;
  videoPrompt?: string;
  context?: string;
  mode: DreamMode;
  isGenerating: boolean;
  generatingId: string | null;
  onGenerate: (id: string, prompt: string, context?: string) => void;
}

const modeIcons: Record<DreamMode, React.ReactNode> = {
  image: <Sparkles className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  audio: <Music className="w-4 h-4" />,
  speech: <Mic className="w-4 h-4" />,
  'image-edit': <Sparkles className="w-4 h-4" />,
};

const modeLabels: Record<DreamMode, string> = {
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  speech: 'Speech',
  'image-edit': 'Edit',
};

export function PromptCard({
  id,
  name,
  prompt,
  videoPrompt,
  context,
  mode,
  isGenerating,
  generatingId,
  onGenerate,
}: PromptCardProps) {
  const activePrompt = mode === 'video' && videoPrompt ? videoPrompt : prompt;
  const isThisGenerating = generatingId === id;

  return (
    <Card className="p-5 bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        {context && (
          <Badge variant="outline" className="text-xs font-mono">
            {context}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {activePrompt}
      </p>
      <Button
        onClick={() => onGenerate(id, activePrompt, context)}
        disabled={isGenerating}
        className="w-full"
        size="sm"
      >
        {isThisGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Dreaming...
          </>
        ) : (
          <>
            {modeIcons[mode]}
            <span className="ml-2">Dream {modeLabels[mode]}</span>
          </>
        )}
      </Button>
    </Card>
  );
}
