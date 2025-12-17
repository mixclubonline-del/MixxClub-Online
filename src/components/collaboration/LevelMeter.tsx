import React from 'react';
import { cn } from '@/lib/utils';

interface LevelMeterProps {
  level: number; // 0-1
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  showPeak?: boolean;
}

export const LevelMeter: React.FC<LevelMeterProps> = ({
  level,
  orientation = 'horizontal',
  className,
  showPeak = true
}) => {
  // Calculate color based on level
  const getColor = (lvl: number) => {
    if (lvl > 0.9) return 'bg-red-500';
    if (lvl > 0.7) return 'bg-yellow-500';
    if (lvl > 0.3) return 'bg-green-500';
    return 'bg-green-600';
  };

  const isHorizontal = orientation === 'horizontal';
  const percentage = Math.min(100, Math.max(0, level * 100));

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-sm bg-muted/50',
        isHorizontal ? 'h-2 w-full' : 'w-2 h-full',
        className
      )}
    >
      {/* Main level bar */}
      <div
        className={cn(
          'absolute transition-all duration-75 rounded-sm',
          getColor(level),
          isHorizontal
            ? 'left-0 top-0 h-full'
            : 'bottom-0 left-0 w-full'
        )}
        style={{
          [isHorizontal ? 'width' : 'height']: `${percentage}%`
        }}
      />
      
      {/* Peak indicator */}
      {showPeak && level > 0.9 && (
        <div
          className={cn(
            'absolute bg-red-600 animate-pulse',
            isHorizontal
              ? 'right-0 top-0 w-1 h-full'
              : 'top-0 left-0 w-full h-1'
          )}
        />
      )}
      
      {/* Gradient overlay for depth */}
      <div
        className={cn(
          'absolute inset-0 opacity-30',
          isHorizontal
            ? 'bg-gradient-to-b from-white/20 to-transparent'
            : 'bg-gradient-to-r from-white/20 to-transparent'
        )}
      />
    </div>
  );
};

interface StereoLevelMeterProps {
  leftLevel: number;
  rightLevel: number;
  className?: string;
}

export const StereoLevelMeter: React.FC<StereoLevelMeterProps> = ({
  leftLevel,
  rightLevel,
  className
}) => {
  return (
    <div className={cn('flex gap-0.5', className)}>
      <LevelMeter level={leftLevel} orientation="vertical" className="h-16" />
      <LevelMeter level={rightLevel} orientation="vertical" className="h-16" />
    </div>
  );
};
