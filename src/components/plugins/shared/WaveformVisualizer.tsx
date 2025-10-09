import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface WaveformVisualizerProps {
  points?: number;
  height?: number;
  amplitude?: number;
  className?: string;
}

export const WaveformVisualizer = ({ 
  points = 100, 
  height = 80,
  amplitude = 0.7,
  className = '' 
}: WaveformVisualizerProps) => {
  const wavePoints = useMemo(() => {
    return Array.from({ length: points }, (_, i) => {
      const x = (i / points) * 100;
      const y = 50 + Math.sin((i / points) * Math.PI * 4) * amplitude * 40 + (Math.random() - 0.5) * 10;
      return `${x},${y}`;
    }).join(' ');
  }, [points, amplitude]);

  return (
    <svg 
      width="100%" 
      height={height}
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="waveform-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF70D0" />
          <stop offset="50%" stopColor="#C5A3FF" />
          <stop offset="100%" stopColor="#70E6FF" />
        </linearGradient>
        <linearGradient id="waveform-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(197,163,255,0.3)" />
          <stop offset="100%" stopColor="rgba(197,163,255,0.05)" />
        </linearGradient>
      </defs>
      
      {/* Fill area */}
      <motion.polygon
        points={`0,100 ${wavePoints} 100,100`}
        fill="url(#waveform-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Main waveform line */}
      <motion.polyline
        points={wavePoints}
        fill="none"
        stroke="url(#waveform-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
      
      {/* Glow effect */}
      <motion.polyline
        points={wavePoints}
        fill="none"
        stroke="url(#waveform-gradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        filter="blur(4px)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
    </svg>
  );
};
