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

const sizeMap = {
  sm: { outer: 48, inner: 36, border: 2, indicator: 2 },
  md: { outer: 64, inner: 48, border: 3, indicator: 2.5 },
  lg: { outer: 80, inner: 60, border: 4, indicator: 3 },
};

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
  
  const dimensions = sizeMap[size];
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
        className="relative cursor-grab active:cursor-grabbing"
        style={{ width: dimensions.outer, height: dimensions.outer }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* AI suggested glow effect */}
        {aiSuggested && (
          <div className="absolute inset-0 rounded-full bg-mixx-glow blur-xl opacity-50 animate-glow-pulse" />
        )}

        {/* Outer gradient ring */}
        <div 
          className="absolute inset-0 rounded-full p-[3px]"
          style={{
            background: 'linear-gradient(135deg, #FF70D0 0%, #C5A3FF 50%, #70E6FF 100%)',
            boxShadow: aiSuggested 
              ? '0 0 20px rgba(255,112,208,0.5), 0 0 40px rgba(112,230,255,0.5)' 
              : '0 0 10px rgba(197,163,255,0.3)',
          }}
        >
          {/* Middle ring - Dark navy background */}
          <div 
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #1A1F35, #0A0E1A)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            {/* Value progress arc */}
            <svg 
              className="absolute inset-0 w-full h-full -rotate-90"
              style={{ width: dimensions.outer, height: dimensions.outer }}
            >
              <defs>
                <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF70D0" />
                  <stop offset="50%" stopColor="#C5A3FF" />
                  <stop offset="100%" stopColor="#70E6FF" />
                </linearGradient>
              </defs>
              <circle
                cx="50%"
                cy="50%"
                r={`${(dimensions.outer / 2) - 6}`}
                fill="none"
                stroke={`url(#gradient-${label})`}
                strokeWidth={dimensions.border}
                strokeDasharray={`${normalizedValue * Math.PI * (dimensions.outer - 12)}, ${Math.PI * (dimensions.outer - 12)}`}
                strokeLinecap="round"
                className="opacity-80"
              />
            </svg>
            
            {/* Knob indicator */}
            <motion.div
              className="absolute rounded-full flex items-center justify-center"
              style={{ 
                width: dimensions.inner, 
                height: dimensions.inner,
                rotate: rotation,
              }}
            >
              {/* Indicator line with gradient */}
              <div 
                className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: dimensions.indicator,
                  height: dimensions.inner * 0.25,
                  background: 'linear-gradient(180deg, #FF70D0, #C5A3FF, #70E6FF)',
                  boxShadow: '0 0 8px rgba(197,163,255,0.8)',
                }}
              />
            </motion.div>
            
            {/* Center dot with cyan glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: '#70E6FF',
                  boxShadow: '0 0 8px #70E6FF',
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Label and value */}
      <div className="text-center space-y-0.5">
        <div className="text-xs text-mixx-cyan uppercase tracking-wider font-medium">{label}</div>
        <div className={`text-sm font-mono font-bold ${aiSuggested ? 'text-mixx-lavender' : 'text-foreground'}`}>
          {displayVal}
        </div>
      </div>
    </div>
  );
};
