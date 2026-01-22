import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Check, X, Eye, Download, RefreshCw } from 'lucide-react';
import type { GenerationResult, DreamMode } from '@/hooks/useDreamEngine';

interface GenerationPreviewProps {
  result: GenerationResult;
  mode: DreamMode;
  prompt: string;
  context: string;
  onSave: (name: string, makeActive: boolean) => Promise<void>;
  onDiscard: () => void;
  onRegenerate: () => void;
  saving: boolean;
}

export function GenerationPreview({
  result,
  mode,
  prompt,
  context,
  onSave,
  onDiscard,
  onRegenerate,
  saving,
}: GenerationPreviewProps) {
  const [name, setName] = useState(`${context}${Date.now()}`);
  const [makeActive, setMakeActive] = useState(true);

  const handleSave = async () => {
    await onSave(name, makeActive);
  };

  const isVideo = mode === 'video';
  const isAudio = mode === 'audio';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 bg-card/50 border border-primary/30 rounded-xl backdrop-blur-sm"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Preview */}
        <div className="flex-1">
          {isVideo ? (
            <video
              src={result.url}
              controls
              autoPlay
              loop
              muted
              className="w-full rounded-lg shadow-2xl max-h-[400px] object-contain bg-black"
            />
          ) : isAudio ? (
            <div className="w-full p-8 bg-muted/30 rounded-lg flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">🎵</span>
              </div>
              <audio src={result.url} controls className="w-full max-w-md" />
            </div>
          ) : (
            <img
              src={result.url}
              alt="Generated"
              className="w-full rounded-lg shadow-2xl max-h-[400px] object-contain"
            />
          )}
        </div>

        {/* Controls */}
        <div className="lg:w-80 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Your Vision</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {prompt}
            </p>

            {/* Name input */}
            <div className="mb-4">
              <Label htmlFor="asset-name" className="text-sm">Asset Name</Label>
              <Input
                id="asset-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter asset name..."
                className="mt-1"
              />
            </div>

            {/* Apply to Site Toggle */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-4">
              <Switch
                id="make-active"
                checked={makeActive}
                onCheckedChange={setMakeActive}
              />
              <Label htmlFor="make-active" className="flex items-center gap-2 cursor-pointer text-sm">
                <Eye className="w-4 h-4" />
                Apply to live site immediately
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="w-full"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {makeActive ? 'Save & Apply' : 'Save to Library'}
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onRegenerate}
                disabled={saving}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button
                variant="ghost"
                onClick={onDiscard}
                disabled={saving}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mt-2"
            >
              <a href={result.url} download target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download Original
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
