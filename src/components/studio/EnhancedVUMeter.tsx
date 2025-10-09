import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { VUMeter } from './VUMeter';

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
  
  const sizeMap = {
    sm: { width: 10, height: 80 },
    md: { width: 12, height: 128 },
    lg: { width: 14, height: 192 },
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <VUMeter
        peakDb={peakDb}
        rmsDb={rmsDb}
        vertical={vertical}
        width={vertical ? sizeMap[size].width : sizeMap[size].height}
        height={vertical ? sizeMap[size].height : sizeMap[size].width}
        showLabel={!!label}
        label={label}
      />

      {/* Additional numeric displays */}
      {(showRMS || showLUFS) && (
        <div className="flex flex-col items-center gap-0.5 -mt-1">
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
      )}
    </div>
  );
};
