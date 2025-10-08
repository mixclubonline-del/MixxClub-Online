import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedVUMeterProps {
  level: number; // 0 to 1
  peakHold?: boolean;
  vertical?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showRMS?: boolean;
  showLUFS?: boolean;
  showPeakDb?: boolean;
}

export const EnhancedVUMeter = ({ 
  level, 
  peakHold = true, 
  vertical = true,
  label,
  size = 'md',
  className,
  showRMS = false,
  showLUFS = false,
  showPeakDb = true,
}: EnhancedVUMeterProps) => {
  const [peak, setPeak] = useState(0);
  const [rms, setRMS] = useState(0);
  const [lufs, setLUFS] = useState(-23);
  const peakTimeout = useRef<NodeJS.Timeout>();
  const rmsHistory = useRef<number[]>([]);

  useEffect(() => {
    // Calculate RMS (400ms window)
    rmsHistory.current.push(level);
    if (rmsHistory.current.length > 20) {
      rmsHistory.current.shift();
    }
    const sumSquares = rmsHistory.current.reduce((sum, val) => sum + val * val, 0);
    const rmsValue = Math.sqrt(sumSquares / rmsHistory.current.length);
    setRMS(rmsValue);

    // Approximate LUFS (K-weighted)
    const lufsValue = 20 * Math.log10(rmsValue || 0.00001) - 0.691;
    setLUFS(Math.max(-60, Math.min(0, lufsValue)));

    // Peak hold
    if (level > peak) {
      setPeak(level);
      if (peakTimeout.current) clearTimeout(peakTimeout.current);
      peakTimeout.current = setTimeout(() => setPeak(0), 1500);
    }
  }, [level, peak]);

  const peakDb = level > 0 ? 20 * Math.log10(level) : -60;
  const rmsDb = rms > 0 ? 20 * Math.log10(rms) : -60;
  const normalizedLevel = Math.max(0, Math.min(1, (peakDb + 60) / 60));
  const normalizedRMS = Math.max(0, Math.min(1, (rmsDb + 60) / 60));
  
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
        {/* RMS background (if enabled) */}
        {showRMS && (
          <div 
            className={cn(
              'absolute bottom-0 left-0 right-0 bg-primary/20 transition-all duration-100',
              vertical ? 'w-full' : 'h-full'
            )}
            style={{
              [vertical ? 'height' : 'width']: `${normalizedRMS * 100}%`
            }}
          />
        )}

        {/* Segmented LEDs (Peak) */}
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

        {/* True Peak indicator */}
        {normalizedLevel >= 0.99 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(var(--led-red))] animate-pulse shadow-[0_0_8px_hsl(var(--led-red))]" />
        )}
      </div>

      {/* Numeric displays */}
      <div className="flex flex-col items-center gap-0.5">
        {showPeakDb && (
          <span className={cn(
            'font-mono text-[hsl(var(--studio-text-dim))] tabular-nums',
            size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[8px]' : 'text-[9px]',
            peakDb > -3 && 'text-[hsl(var(--led-red))] font-bold'
          )}>
            {peakDb > -60 ? `${peakDb.toFixed(0)}` : '-∞'}
          </span>
        )}
        {showRMS && (
          <span className={cn(
            'font-mono text-[hsl(var(--studio-text-dim))/0.7] tabular-nums',
            size === 'sm' ? 'text-[6px]' : size === 'md' ? 'text-[7px]' : 'text-[8px]'
          )}>
            R:{rmsDb > -60 ? `${rmsDb.toFixed(0)}` : '-∞'}
          </span>
        )}
        {showLUFS && (
          <span className={cn(
            'font-mono text-[hsl(var(--studio-text-dim))/0.7] tabular-nums',
            size === 'sm' ? 'text-[6px]' : size === 'md' ? 'text-[7px]' : 'text-[8px]'
          )}>
            L:{lufs.toFixed(0)}
          </span>
        )}
      </div>
    </div>
  );
};
