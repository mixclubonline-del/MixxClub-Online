import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PluginKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
  displayValue?: (value: number) => string;
  size?: 'sm' | 'md' | 'lg';
  aiSuggested?: boolean;
}

export const PluginKnob: React.FC<PluginKnobProps> = ({
  label,
  value,
  min,
  max,
  unit = '',
  onChange,
  displayValue,
  size = 'md',
  aiSuggested = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const normalizedValue = (value - min) / (max - min);
  const rotation = -135 + (normalizedValue * 270); // -135° to 135°

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = startYRef.current - e.clientY;
    const sensitivity = (max - min) / 200;
    const newValue = Math.max(min, Math.min(max, startValueRef.current + deltaY * sensitivity));
    onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * ((max - min) / 1000);
    const newValue = Math.max(min, Math.min(max, value + delta));
    onChange(newValue);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, value]);

  const displayVal = displayValue ? displayValue(value) : `${value.toFixed(1)}${unit}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className={`relative ${sizeClasses[size]} cursor-grab active:cursor-grabbing`}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Outer glow ring for AI suggestions */}
        {aiSuggested && (
          <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-md animate-pulse" />
        )}
        
        {/* Knob background with 3D depth */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(230_25%_30%)] via-[hsl(230_30%_18%)] to-[hsl(230_35%_12%)] 
          border border-white/10 shadow-[0_4px_16px_hsl(220_30%_5%/0.5),inset_0_1px_2px_hsl(0_0%_100%/0.05)]">
          
          {/* Gradient ring track */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 opacity-40">
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              fill="none"
              stroke="url(#gradient-track)"
              strokeWidth="2"
              strokeDasharray="1, 4"
              className="opacity-30"
            />
            <defs>
              <linearGradient id="gradient-track" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(270 100% 70%)" />
                <stop offset="100%" stopColor="hsl(185 100% 50%)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Value arc with gradient */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              fill="none"
              stroke="url(#gradient-value)"
              strokeWidth="3"
              strokeDasharray={`${normalizedValue * 251}, 251`}
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_hsl(185_100%_50%/0.8)]"
            />
            <defs>
              <linearGradient id="gradient-value" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(270 100% 70%)" />
                <stop offset="50%" stopColor="hsl(300 90% 65%)" />
                <stop offset="100%" stopColor="hsl(185 100% 50%)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Inner knob with rotation indicator */}
          <motion.div
            className="absolute inset-[18%] rounded-full bg-gradient-to-br from-[hsl(230_20%_35%)] via-[hsl(230_25%_22%)] to-[hsl(230_30%_16%)]
              shadow-[inset_0_2px_6px_hsl(220_30%_8%/0.6),inset_0_1px_2px_hsl(220_30%_5%/0.4)]"
            style={{ rotate: rotation }}
          >
            {/* Indicator line with glow */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full 
              bg-gradient-to-b from-[hsl(185_100%_50%)] to-[hsl(185_100%_40%)]
              shadow-[0_0_8px_hsl(185_100%_50%/0.8),0_0_4px_hsl(185_100%_50%/0.6)]" />
          </motion.div>
          
          {/* Center highlight */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 shadow-inner" />
          </div>
        </div>
      </motion.div>
      
      {/* Label and value */}
      <div className="text-center space-y-0.5">
        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
        <div className={`text-sm font-mono font-semibold ${aiSuggested ? 'text-[hsl(185_100%_50%)]' : 'text-foreground'}`}>
          {displayVal}
        </div>
      </div>
    </div>
  );
};
