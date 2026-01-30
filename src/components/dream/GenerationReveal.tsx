import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw, Download, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DreamChamberGuide } from './DreamChamberGuide';
import { cn } from '@/lib/utils';
import type { DreamMode } from '@/hooks/useDreamEngine';

interface GenerationRevealProps {
  result: {
    url: string;
    type: string;
  };
  mode: DreamMode;
  prompt: string;
  context: string;
  onSave: (name: string, makeActive: boolean) => void;
  onDiscard: () => void;
  onRegenerate: () => void;
  saving: boolean;
}

export function GenerationReveal({
  result,
  mode,
  prompt,
  context,
  onSave,
  onDiscard,
  onRegenerate,
  saving,
}: GenerationRevealProps) {
  const [name, setName] = useState(`${context}_${Date.now()}`);
  const [makeActive, setMakeActive] = useState(true);
  const [revealed, setRevealed] = useState(false);

  // Trigger reveal after mount
  useState(() => {
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  });

  const handleSave = () => {
    onSave(name, makeActive);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
    >
      {/* Particle burst effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {revealed && Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              left: '50%',
              top: '50%',
              backgroundColor: `hsl(${270 + Math.random() * 60} 75% 55% / ${Math.random() * 0.6 + 0.2})`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
              x: (Math.random() - 0.5) * 600,
              y: (Math.random() - 0.5) * 600,
              opacity: 0,
              scale: 1,
            }}
            transition={{
              duration: 1.5,
              delay: Math.random() * 0.3,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Ambient glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, hsl(270 75% 55% / 0.15) 0%, transparent 50%)'
        }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 20 }}
        className="relative w-full max-w-4xl mx-4"
      >
        {/* Prime celebration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 flex justify-center"
        >
          <DreamChamberGuide state="success" compact />
        </motion.div>

        {/* Result preview */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20 mb-6"
        >
          {mode === 'video' ? (
            <video
              src={result.url}
              controls
              autoPlay
              loop
              muted
              className="w-full aspect-video object-cover"
            />
          ) : mode === 'audio' ? (
            <div className="p-8 bg-gradient-to-br from-purple-900/20 to-cyan-900/20">
              <audio src={result.url} controls className="w-full" />
            </div>
          ) : (
            <img
              src={result.url}
              alt="Generated"
              className="w-full aspect-video object-cover"
            />
          )}
          
          {/* Overlay glow */}
          <div className="absolute inset-0 pointer-events-none border-2 border-primary/20 rounded-2xl" />
        </motion.div>

        {/* Save options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/80 backdrop-blur rounded-xl border border-border/50 p-6"
        >
          {/* Context & Prompt info */}
          <div className="mb-4">
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-mono">
              {context}
            </span>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{prompt}</p>
          </div>

          {/* Name input */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-1 block">Asset Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter asset name..."
              className="bg-background/50"
            />
          </div>

          {/* Make active checkbox */}
          <div className="flex items-center gap-2 mb-6">
            <Checkbox
              id="makeActive"
              checked={makeActive}
              onCheckedChange={(checked) => setMakeActive(checked === true)}
            />
            <label htmlFor="makeActive" className="text-sm cursor-pointer">
              Make this the live asset for <span className="text-primary font-mono">{context}</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex-1 gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save to Library
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onRegenerate}
              disabled={saving}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </Button>
            
            <Button
              variant="ghost"
              onClick={onDiscard}
              disabled={saving}
              className="gap-2 text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
              Discard
            </Button>
          </div>
        </motion.div>

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onDiscard}
          className="absolute -top-2 -right-2 p-2 rounded-full bg-card border border-border hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
