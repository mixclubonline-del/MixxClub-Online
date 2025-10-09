import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface AudioWaveformBgProps {
  bars?: number;
  height?: number;
  className?: string;
}

export const AudioWaveformBg = ({ 
  bars = 50, 
  height = 60,
  className = '' 
}: AudioWaveformBgProps) => {
  const barHeights = useMemo(() => {
    return Array.from({ length: bars }, () => Math.random() * 0.7 + 0.3);
  }, [bars]);

  return (
    <div 
      className={`flex items-end justify-center gap-1 ${className}`}
      style={{ height }}
    >
      {barHeights.map((heightRatio, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-t-full bg-gradient-to-t from-mixx-pink via-mixx-lavender to-mixx-cyan opacity-30"
          initial={{ height: 0 }}
          animate={{ 
            height: `${heightRatio * 100}%`,
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.01,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};
