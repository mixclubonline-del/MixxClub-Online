import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { RackUnit } from './RackUnit';
import { EffectUnit } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';

interface HardwareRackProps {
  effects: EffectUnit[];
  onAddEffect: () => void;
  onToggleEffect: (id: string) => void;
  onConfigureEffect: (id: string) => void;
  onUpdateParameter: (id: string, param: string, value: number) => void;
  onRemoveEffect: (id: string) => void;
}

export const HardwareRack = ({
  effects,
  onAddEffect,
  onToggleEffect,
  onConfigureEffect,
  onUpdateParameter,
}: HardwareRackProps) => {
  
  const sortedEffects = [...effects].sort((a, b) => a.rackPosition - b.rackPosition);

  return (
    <div className="glass rounded-2xl p-6 border border-[hsl(var(--border)/0.5)] shadow-[var(--shadow-glass)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Hardware Rack
          </h3>
          <div className="flex items-center gap-1">
            {/* Rack LEDs */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  i === 0 ? 'bg-green-500' : i === 1 ? 'bg-yellow-500' : 'bg-red-500',
                  'animate-pulse'
                )}
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>
        
        <motion.button
          onClick={onAddEffect}
          className={cn(
            'px-3 py-1.5 rounded-lg flex items-center gap-2',
            'bg-gradient-primary text-foreground text-sm font-semibold',
            'hover:shadow-[var(--shadow-glow)] transition-all'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          Add Unit
        </motion.button>
      </div>

      {/* Rack units container */}
      <div className="relative">
        {/* Rack rails (visual) */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[hsl(var(--border))] to-transparent opacity-30" />
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-[hsl(var(--border))] to-transparent opacity-30" />
        
        <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
          <AnimatePresence>
            {sortedEffects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 rounded-full glass border border-[hsl(var(--border)/0.5)] flex items-center justify-center mb-3">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No effects loaded
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click "Add Unit" to insert a processor
                </p>
              </motion.div>
            ) : (
              sortedEffects.map((effect) => (
                <RackUnit
                  key={effect.id}
                  effect={effect}
                  onToggle={() => onToggleEffect(effect.id)}
                  onConfigure={() => onConfigureEffect(effect.id)}
                  onParameterChange={(param, value) => 
                    onUpdateParameter(effect.id, param, value)
                  }
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rack info footer */}
      <div className="mt-4 pt-4 border-t border-[hsl(var(--border)/0.5)] flex items-center justify-between">
        <div className="text-[10px] font-mono text-muted-foreground">
          {sortedEffects.length} / 12 Units
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">
          {sortedEffects.filter(e => e.enabled).length} Active
        </div>
      </div>
    </div>
  );
};
