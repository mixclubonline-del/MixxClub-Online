import { motion, Reorder } from 'framer-motion';
import { Power, Settings, GripVertical, Activity, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EffectUnit } from '@/stores/aiStudioStore';
import { useState } from 'react';

interface RackUnitProps {
  effect: EffectUnit;
  onToggle: () => void;
  onConfigure: () => void;
  onParameterChange: (param: string, value: number) => void;
  onRemove?: () => void;
  isDraggable?: boolean;
  showMeters?: boolean;
}

export const RackUnit = ({ 
  effect, 
  onToggle, 
  onConfigure,
  onParameterChange,
  onRemove,
  isDraggable = true,
  showMeters = true,
}: RackUnitProps) => {
  const [inputLevel, setInputLevel] = useState(0.5);
  const [outputLevel, setOutputLevel] = useState(0.6);
  const [abState, setABState] = useState<'A' | 'B'>('A');
  const [stateA, setStateA] = useState(effect.parameters);
  const [stateB, setStateB] = useState(effect.parameters);
  const [mixAmount, setMixAmount] = useState(1.0);
  
  const unitColors: Record<string, string> = {
    eq: 'from-blue-500/20 to-blue-600/20',
    compressor: 'from-orange-500/20 to-orange-600/20',
    reverb: 'from-purple-500/20 to-purple-600/20',
    delay: 'from-green-500/20 to-green-600/20',
    limiter: 'from-red-500/20 to-red-600/20',
    saturator: 'from-yellow-500/20 to-yellow-600/20',
  };

  const ledColor = effect.enabled ? 'bg-green-500' : 'bg-red-500';

  const handleABToggle = () => {
    if (abState === 'A') {
      setStateA(effect.parameters);
      setABState('B');
      Object.entries(stateB).forEach(([param, value]) => {
        onParameterChange(param, value);
      });
    } else {
      setStateB(effect.parameters);
      setABState('A');
      Object.entries(stateA).forEach(([param, value]) => {
        onParameterChange(param, value);
      });
    }
  };

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
        {/* Drag handle */}
        {isDraggable && (
          <div className="cursor-grab active:cursor-grabbing p-1 -ml-1">
            <GripVertical className="w-3 h-3 text-[hsl(var(--studio-text-dim))]" />
          </div>
        )}
        
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

        {/* A/B, Mix, Power and settings */}
        <div className="flex items-center gap-2">
          {/* A/B Toggle */}
          <motion.button
            onClick={handleABToggle}
            className={cn(
              'px-1.5 py-1 rounded text-[8px] font-bold',
              'glass border border-[hsl(var(--border)/0.5)]',
              'hover:bg-[hsl(var(--card)/0.9)]'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="A/B Compare"
          >
            {abState}
          </motion.button>

          {/* Mix Knob */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[7px] font-mono text-muted-foreground">MIX</span>
            <input
              type="range"
              min="0"
              max="100"
              value={mixAmount * 100}
              onChange={(e) => setMixAmount(Number(e.target.value) / 100)}
              className="w-8 h-1"
              title={`${Math.round(mixAmount * 100)}% wet`}
            />
          </div>

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

      {/* I/O Meters (if enabled) */}
      {showMeters && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[7px] font-mono text-muted-foreground">IN</span>
            <div className="h-1 bg-[hsl(var(--studio-black))] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[hsl(var(--led-green))] transition-all duration-75"
                style={{ width: `${inputLevel * 100}%` }}
              />
            </div>
          </div>
          <Activity className="w-2 h-2 text-muted-foreground" />
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-[7px] font-mono text-muted-foreground">OUT</span>
            <div className="h-1 bg-[hsl(var(--studio-black))] rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-75"
                style={{ width: `${outputLevel * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

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
