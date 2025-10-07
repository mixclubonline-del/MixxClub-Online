import { useEffect, useRef, useState } from 'react';
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
  
  const segments = 20;
  const sizeClasses = {
    sm: vertical ? 'h-20 w-3' : 'w-20 h-3',
    md: vertical ? 'h-32 w-4' : 'w-32 h-4',
    lg: vertical ? 'h-48 w-5' : 'w-48 h-5',
  };

  const getSegmentColor = (segmentIndex: number) => {
    const position = segmentIndex / segments;
    if (position > 0.85) return 'bg-[hsl(var(--led-red))]';
    if (position > 0.65) return 'bg-[hsl(var(--led-yellow))]';
    return 'bg-[hsl(var(--led-green))]';
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {label && (
        <span className="text-[8px] font-mono text-[hsl(var(--studio-text-dim))] uppercase tracking-wider">
          {label}
        </span>
      )}
      
      <div 
        className={cn(
          'relative rounded overflow-hidden',
          sizeClasses[size]
        )}
        style={{
          background: 'hsl(var(--studio-black))',
          boxShadow: 'var(--shadow-recessed)',
          border: '1px solid hsl(0 0% 0% / 0.6)',
        }}
      >
        {/* Segmented LEDs */}
        <div className={cn(
          'absolute inset-0 flex gap-[0.5px] p-[2px]',
          vertical ? 'flex-col-reverse' : 'flex-row'
        )}>
          {Array.from({ length: segments }).map((_, i) => {
            const segmentPos = i / segments;
            const isLit = normalizedLevel >= segmentPos;
            const isPeak = peakHold && Math.abs(peak - segmentPos) < 0.05;
            
            const getSegmentShadow = () => {
              if (!isLit && !isPeak) return 'inset 0 1px 2px hsl(0 0% 0% / 0.5)';
              if (i > segments * 0.85) return 'var(--shadow-glow-led-red), inset 0 -1px 2px hsl(0 100% 30%)';
              if (i > segments * 0.65) return 'var(--shadow-glow-led-yellow), inset 0 -1px 2px hsl(60 100% 30%)';
              return 'var(--shadow-glow-led-green), inset 0 -1px 2px hsl(142 100% 30%)';
            };
            
            return (
              <div
                key={i}
                className={cn(
                  'flex-1 transition-all duration-75 rounded-[1px]',
                  isLit || isPeak 
                    ? getSegmentColor(i)
                    : 'bg-[hsl(var(--led-off))]'
                )}
                style={{
                  boxShadow: getSegmentShadow(),
                  border: isLit ? '0.5px solid rgba(255,255,255,0.2)' : '0.5px solid rgba(0,0,0,0.3)',
                }}
              />
            );
          })}
        </div>

        {/* Clip indicator */}
        {normalizedLevel >= 0.95 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(var(--led-red))] animate-pulse shadow-[0_0_8px_hsl(var(--led-red))]" />
        )}
      </div>

      {/* dB value */}
      <span className={cn(
        'font-mono text-[hsl(var(--studio-text-dim))] tabular-nums',
        size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[8px]' : 'text-[9px]'
      )}>
        {dbValue > -60 ? `${dbValue.toFixed(0)}` : '-∞'}
      </span>
    </div>
  );
};
