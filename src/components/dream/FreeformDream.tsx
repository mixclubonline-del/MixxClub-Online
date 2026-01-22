import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { ContextSelector } from './ContextSelector';
import { StylePresetSelector } from './StylePresetSelector';
import type { AssetContext, DreamMode } from '@/hooks/useDreamEngine';

interface FreeformDreamProps {
  contexts: AssetContext[];
  loadingContexts: boolean;
  mode: DreamMode;
  isGenerating: boolean;
  onGenerate: (prompt: string, context: string, style?: string) => void;
}

export function FreeformDream({
  contexts,
  loadingContexts,
  mode,
  isGenerating,
  onGenerate,
}: FreeformDreamProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('none');

  const handleSubmit = () => {
    if (!prompt.trim() || !selectedContext) return;
    onGenerate(prompt.trim(), selectedContext, selectedStyle !== 'none' ? selectedStyle : undefined);
  };

  const canGenerate = prompt.trim().length > 0 && selectedContext && !isGenerating;

  return (
    <div className="space-y-4 p-6 bg-card/30 rounded-xl border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Freeform Dream</h3>
      </div>
      
      <div>
        <Label htmlFor="dream-prompt" className="text-sm text-muted-foreground mb-2 block">
          Describe your vision in detail...
        </Label>
        <Textarea
          id="dream-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A cinematic portrait of a music producer in their studio, surrounded by vintage gear and modern technology. Purple and cyan lighting creates a moody atmosphere..."
          className="min-h-[120px] resize-none"
          disabled={isGenerating}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">
            Context <span className="text-destructive">*</span>
          </Label>
          <ContextSelector
            contexts={contexts}
            loading={loadingContexts}
            value={selectedContext}
            onChange={setSelectedContext}
            placeholder="Select asset context..."
          />
        </div>
        
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">
            Style Preset
          </Label>
          <StylePresetSelector
            value={selectedStyle}
            onChange={setSelectedStyle}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canGenerate}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Dreaming...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Dream It
          </>
        )}
      </Button>
    </div>
  );
}
