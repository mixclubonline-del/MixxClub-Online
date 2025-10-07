import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VUMeterProps {
  level: number; // 0 to 1
  peakHold?: boolean;
  vertical?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VUMeter = ({ 
  level, 
  peakHold = true, 
  vertical = true,
  label,
  size = 'md',
  className 
}: VUMeterProps) => {
  const [peak, setPeak] = useState(0);
  const peakTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (level > peak) {
      setPeak(level);
      if (peakTimeout.current) clearTimeout(peakTimeout.current);
      peakTimeout.current = setTimeout(() => setPeak(0), 1500);
    }
  }, [level, peak]);

  const dbValue = level > 0 ? 20 * Math.log10(level) : -60;
  const normalizedLevel = Math.max(0, Math.min(1, (dbValue + 60) / 60));
  
  const sizeClasses = {
    sm: vertical ? 'h-16 w-2' : 'w-16 h-2',
    md: vertical ? 'h-32 w-3' : 'w-32 h-3',
    lg: vertical ? 'h-48 w-4' : 'w-48 h-4',
  };

  const getBarColor = (position: number) => {
    if (position > 0.9) return 'bg-red-500';
    if (position > 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {label && (
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      )}
      
      <div className={cn(
        'relative rounded-full overflow-hidden',
        'bg-[hsl(var(--card)/0.8)] border border-[hsl(var(--border)/0.5)]',
        sizeClasses[size]
      )}>
        {/* Background segments */}
        <div className={cn(
          'absolute inset-0 flex',
          vertical ? 'flex-col-reverse' : 'flex-row'
        )}>
          {Array.from({ length: 20 }).map((_, i) => {
            const segmentPos = i / 20;
            return (
              <div
                key={i}
                className={cn(
                  'flex-1',
                  vertical ? 'border-t' : 'border-l',
                  'border-[hsl(var(--border)/0.3)]'
                )}
              />
            );
          })}
        </div>

        {/* Active level bar */}
        <motion.div
          className={cn(
            'absolute',
            vertical ? 'bottom-0 left-0 right-0' : 'left-0 top-0 bottom-0',
            getBarColor(normalizedLevel),
            'shadow-[var(--shadow-glow)]'
          )}
          style={{
            [vertical ? 'height' : 'width']: `${normalizedLevel * 100}%`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* Peak hold indicator */}
        {peakHold && peak > 0 && (
          <motion.div
            className={cn(
              'absolute bg-white',
              vertical 
                ? 'left-0 right-0 h-[2px]' 
                : 'top-0 bottom-0 w-[2px]'
            )}
            style={{
              [vertical ? 'bottom' : 'left']: `${(peak / 1) * 100}%`,
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}

        {/* Clip indicator */}
        {normalizedLevel >= 0.95 && (
          <div className="absolute inset-0 bg-red-500 opacity-50 animate-pulse" />
        )}
      </div>

      {/* dB value */}
      <span className={cn(
        'font-mono text-muted-foreground tabular-nums',
        size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-[10px]' : 'text-xs'
      )}>
        {dbValue > -60 ? `${dbValue.toFixed(1)}dB` : '-∞'}
      </span>
    </div>
  );
};
