import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Zap, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Preset {
  id: 'budget' | 'standard' | 'premium' | 'pro';
  label: string;
  lease: number;
  exclusive: number;
  icon: typeof DollarSign;
  description: string;
  color: string;
  popular?: boolean;
}

const PRESETS: readonly Preset[] = [
  { 
    id: 'budget', 
    label: 'Budget', 
    lease: 1999, 
    exclusive: 19900,
    icon: DollarSign,
    description: 'Great for starting out',
    color: 'text-emerald-500',
  },
  { 
    id: 'standard', 
    label: 'Standard', 
    lease: 2999, 
    exclusive: 29900,
    icon: Zap,
    description: 'Most common choice',
    popular: true,
    color: 'text-primary',
  },
  { 
    id: 'premium', 
    label: 'Premium', 
    lease: 4999, 
    exclusive: 49900,
    icon: Sparkles,
    description: 'For established producers',
    color: 'text-amber-500',
  },
  { 
    id: 'pro', 
    label: 'Pro', 
    lease: 9999, 
    exclusive: 99900,
    icon: Crown,
    description: 'Top-tier pricing',
    color: 'text-purple-500',
  },
];

type PresetId = typeof PRESETS[number]['id'];

interface PricingTierPresetsProps {
  selectedPreset?: PresetId | null;
  onSelect: (preset: { lease: number; exclusive: number; id: PresetId }) => void;
  className?: string;
}

const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function PricingTierPresets({ selectedPreset, onSelect, className }: PricingTierPresetsProps) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-3', className)}>
      {PRESETS.map((preset) => {
        const Icon = preset.icon;
        const isSelected = selectedPreset === preset.id;
        
        return (
          <motion.button
            key={preset.id}
            type="button"
            onClick={() => onSelect({ lease: preset.lease, exclusive: preset.exclusive, id: preset.id })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'relative flex flex-col items-center p-4 rounded-lg border-2 transition-all text-left',
              isSelected 
                ? 'border-primary bg-primary/10' 
                : 'border-border hover:border-muted-foreground/50 bg-card/50'
            )}
          >
            {preset.popular && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full">
                Popular
              </span>
            )}
            
            <div className={cn('mb-2', preset.color)}>
              <Icon className="h-6 w-6" />
            </div>
            
            <span className="font-semibold text-sm">{preset.label}</span>
            
            <div className="mt-2 text-center">
              <div className="text-xs text-muted-foreground">Lease</div>
              <div className="font-bold text-foreground">{formatPrice(preset.lease)}</div>
            </div>
            
            <div className="mt-1 text-center">
              <div className="text-xs text-muted-foreground">Exclusive</div>
              <div className="font-bold text-foreground">{formatPrice(preset.exclusive)}</div>
            </div>
            
            <p className="mt-2 text-[10px] text-muted-foreground text-center">
              {preset.description}
            </p>
            
            {isSelected && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="h-3 w-3 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export { PRESETS };
export type { PresetId };
