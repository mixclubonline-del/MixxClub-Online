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
        {/* Knob background */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-white/5 
          border border-white/20 shadow-lg ${aiSuggested ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''}`}>
          {/* Value arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray={`${normalizedValue * 251}, 251`}
              className="opacity-60"
            />
          </svg>
          
          {/* Knob indicator */}
          <motion.div
            className="absolute inset-[15%] rounded-full bg-gradient-to-br from-white/20 to-white/5"
            style={{ rotate: rotation }}
          >
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-primary rounded-full shadow-glow" />
          </motion.div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/40" />
          </div>
        </div>
      </motion.div>
      
      {/* Label and value */}
      <div className="text-center space-y-0.5">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`text-sm font-mono font-medium ${aiSuggested ? 'text-primary' : 'text-foreground'}`}>
          {displayVal}
        </div>
      </div>
    </div>
  );
};
