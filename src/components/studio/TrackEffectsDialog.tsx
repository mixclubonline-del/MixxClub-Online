import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Plus, Sliders, FolderOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EffectUnit } from '@/stores/aiStudioStore';
import { RackUnit } from './RackUnit';
import { PresetManager } from './PresetManager';
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
  onReorderEffects?: (effectIds: string[]) => void;
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
  onReorderEffects,
}: TrackEffectsDialogProps) => {
  const [presetManagerOpen, setPresetManagerOpen] = useState(false);
  const [selectedEffectForPreset, setSelectedEffectForPreset] = useState<EffectUnit | null>(null);
  
  const handleReorder = (newOrder: EffectUnit[]) => {
    if (onReorderEffects) {
      onReorderEffects(newOrder.map(e => e.id));
    }
  };

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
                <Reorder.Group axis="y" values={effects} onReorder={handleReorder}>
                  {effects.map((effect) => (
                    <Reorder.Item key={effect.id} value={effect}>
                      <div className="mb-3">
                        <RackUnit
                          effect={effect}
                          onToggle={() => onToggleEffect(effect.id)}
                          onConfigure={() => {
                            setSelectedEffectForPreset(effect);
                            setPresetManagerOpen(true);
                          }}
                          onParameterChange={(param, value) =>
                            onUpdateParameter(effect.id, param, value)
                          }
                          onRemove={() => onRemoveEffect(effect.id)}
                          isDraggable={true}
                          showMeters={true}
                        />
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Preset Manager */}
        {selectedEffectForPreset && (
          <PresetManager
            effectType={selectedEffectForPreset.type}
            currentParameters={selectedEffectForPreset.parameters}
            onLoadPreset={(params) => {
              Object.entries(params).forEach(([param, value]) => {
                onUpdateParameter(selectedEffectForPreset.id, param, value);
              });
            }}
            isOpen={presetManagerOpen}
            onClose={() => {
              setPresetManagerOpen(false);
              setSelectedEffectForPreset(null);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
