import { motion } from 'framer-motion';
import { Power, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EffectUnit } from '@/stores/aiStudioStore';

interface RackUnitProps {
  effect: EffectUnit;
  onToggle: () => void;
  onConfigure: () => void;
  onParameterChange: (param: string, value: number) => void;
  onRemove?: () => void;
}

export const RackUnit = ({ 
  effect, 
  onToggle, 
  onConfigure,
  onParameterChange,
  onRemove
}: RackUnitProps) => {
  
  const unitColors: Record<string, string> = {
    eq: 'from-blue-500/20 to-blue-600/20',
    compressor: 'from-orange-500/20 to-orange-600/20',
    reverb: 'from-purple-500/20 to-purple-600/20',
    delay: 'from-green-500/20 to-green-600/20',
    limiter: 'from-red-500/20 to-red-600/20',
    saturator: 'from-yellow-500/20 to-yellow-600/20',
  };

  const ledColor = effect.enabled ? 'bg-green-500' : 'bg-red-500';

  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-lg',
        'bg-gradient-to-br',
        unitColors[effect.type] || 'from-[hsl(var(--card))] to-[hsl(var(--card)/0.8)]',
        'border-2 border-[hsl(var(--border)/0.8)]',
        'shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]',
        !effect.enabled && 'opacity-50'
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Rack unit faceplate */}
      <div className="flex items-center justify-between mb-3">
        {/* Model name */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className={cn(
              'w-2 h-2 rounded-full',
              ledColor,
              effect.enabled && 'animate-pulse shadow-[0_0_8px_currentColor]'
            )} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {effect.name}
            </h4>
            <p className="text-[10px] text-muted-foreground uppercase">
              {effect.type}
            </p>
          </div>
        </div>

        {/* Power and settings */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onConfigure}
            className={cn(
              'p-1.5 rounded',
              'glass border border-[hsl(var(--border)/0.5)]',
              'hover:bg-[hsl(var(--card)/0.9)]'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-3 h-3" />
          </motion.button>
          <motion.button
            onClick={onToggle}
            className={cn(
              'p-1.5 rounded',
              effect.enabled 
                ? 'bg-primary text-primary-foreground shadow-[var(--shadow-glow)]' 
                : 'glass border border-[hsl(var(--border)/0.5)]'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Power className="w-3 h-3" />
          </motion.button>
        </div>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(effect.parameters).map(([param, value]) => (
          <div key={param} className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-mono uppercase text-muted-foreground tracking-wider">
              {param}
            </span>
            <div className="relative">
              <motion.div
                className={cn(
                  'w-10 h-10 rounded-full cursor-pointer',
                  'bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--card)/0.6)]',
                  'border-2 border-[hsl(var(--border))]',
                  'shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]',
                  effect.enabled && 'hover:border-primary'
                )}
                style={{
                  rotate: `${(value - 0.5) * 270}deg`,
                }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onDrag={(_, info) => {
                  const angle = Math.atan2(info.offset.y, info.offset.x);
                  const normalized = (angle / (Math.PI * 1.5)) + 0.5;
                  const newValue = Math.max(0, Math.min(1, normalized));
                  onParameterChange(param, newValue);
                }}
              >
                {/* Indicator */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-2 bg-primary rounded-full" />
              </motion.div>
            </div>
            <span className="text-[8px] font-mono text-muted-foreground tabular-nums">
              {Math.round(value * 100)}
            </span>
          </div>
        ))}
      </div>

      {/* Rack screws (visual detail) */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--border))] shadow-inner" />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--border))] shadow-inner" />
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--border))] shadow-inner" />
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--border))] shadow-inner" />
    </motion.div>
  );
};
