import { motion } from 'framer-motion';
import { useDepth } from '@/contexts/DepthContext';
import { Progress } from '@/components/ui/progress';
import { Users, Mic2, Star, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const LAYER_ICONS = {
  'posted-up': Eye,
  'in-the-room': Users,
  'on-the-mic': Mic2,
  'on-stage': Star,
};

const LAYER_COLORS = {
  'posted-up': 'text-muted-foreground',
  'in-the-room': 'text-primary',
  'on-the-mic': 'text-accent-cyan',
  'on-stage': 'text-yellow-400',
};

interface DepthIndicatorProps {
  compact?: boolean;
  showProgress?: boolean;
  className?: string;
}

export function DepthIndicator({ 
  compact = false, 
  showProgress = true,
  className 
}: DepthIndicatorProps) {
  const { 
    currentLayer, 
    layerInfo, 
    puttinInScore, 
    progressToNext, 
    nextLayer,
    loading 
  } = useDepth();

  if (loading) return null;

  const Icon = LAYER_ICONS[currentLayer];
  const colorClass = LAYER_COLORS[currentLayer];

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-card/50 backdrop-blur-sm border border-border/50",
          className
        )}
      >
        <Icon className={cn("w-4 h-4", colorClass)} />
        <span className="text-sm font-medium">{layerInfo.label}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl",
        "bg-card/80 backdrop-blur-sm border border-border/50",
        className
      )}
    >
      {/* Current Layer */}
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-primary/20 to-accent/20"
        )}>
          <Icon className={cn("w-5 h-5", colorClass)} />
        </div>
        <div>
          <p className={cn("font-semibold", colorClass)}>{layerInfo.label}</p>
          <p className="text-xs text-muted-foreground">{layerInfo.description}</p>
        </div>
      </div>

      {/* Puttin' In Score */}
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">Puttin' In</span>
        <span className="font-mono font-medium">{puttinInScore}</span>
      </div>

      {/* Progress to Next Layer */}
      {showProgress && nextLayer && (
        <div className="space-y-1">
          <Progress value={progressToNext} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {Math.round(progressToNext)}% to {nextLayer.replace(/-/g, ' ')}
          </p>
        </div>
      )}

      {/* At max layer */}
      {!nextLayer && (
        <div className="flex items-center gap-2 text-xs text-yellow-400">
          <Star className="w-3 h-3" />
          <span>You ARE the glow</span>
        </div>
      )}
    </motion.div>
  );
}
