import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sliders } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EffectUnit } from '@/stores/aiStudioStore';
import { RackUnit } from './RackUnit';
import { cn } from '@/lib/utils';

interface TrackEffectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackName: string;
  effects: EffectUnit[];
  onAddEffect: () => void;
  onToggleEffect: (id: string) => void;
  onUpdateParameter: (id: string, param: string, value: number) => void;
  onRemoveEffect: (id: string) => void;
}

export const TrackEffectsDialog = ({
  open,
  onOpenChange,
  trackName,
  effects,
  onAddEffect,
  onToggleEffect,
  onUpdateParameter,
  onRemoveEffect,
}: TrackEffectsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[hsl(var(--studio-black))] border-[hsl(var(--studio-border))]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[hsl(var(--studio-text))]">
            <Sliders className="w-5 h-5" />
            {trackName} - Effects Chain
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-[hsl(var(--studio-text-dim))]">
              {effects.length} effect{effects.length !== 1 ? 's' : ''} loaded
            </div>
            <motion.button
              onClick={onAddEffect}
              className={cn(
                'px-3 py-1.5 rounded-lg flex items-center gap-2',
                'bg-gradient-primary text-white text-sm font-semibold',
                'hover:shadow-[var(--shadow-glow)] transition-all',
                'border border-[hsl(var(--studio-accent)/0.3)]'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              Add Effect
            </motion.button>
          </div>

          <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            <AnimatePresence>
              {effects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full glass-studio border border-[hsl(var(--studio-border)/0.5)] flex items-center justify-center mb-3">
                    <Plus className="w-8 h-8 text-[hsl(var(--studio-text-dim))]" />
                  </div>
                  <p className="text-sm text-[hsl(var(--studio-text))]">
                    No effects on this track
                  </p>
                  <p className="text-xs text-[hsl(var(--studio-text-dim))] mt-1">
                    Add effects to process the audio
                  </p>
                </motion.div>
              ) : (
                effects.map((effect) => (
                  <RackUnit
                    key={effect.id}
                    effect={effect}
                    onToggle={() => onToggleEffect(effect.id)}
                    onConfigure={() => {}}
                    onParameterChange={(param, value) =>
                      onUpdateParameter(effect.id, param, value)
                    }
                    onRemove={() => onRemoveEffect(effect.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
