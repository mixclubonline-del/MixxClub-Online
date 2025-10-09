import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface AIBrainIconProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export const AIBrainIcon = ({ 
  size = 24, 
  animated = true,
  className = '' 
}: AIBrainIconProps) => {
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size + 8, height: size + 8 }}
      animate={animated ? {
        scale: [1, 1.1, 1],
      } : undefined}
      transition={animated ? {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      } : undefined}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-md opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(255,112,208,0.6), rgba(197,163,255,0.4), rgba(112,230,255,0.6))',
        }}
      />
      
      {/* Icon container with gradient */}
      <div
        className="relative rounded-full p-1"
        style={{
          background: 'linear-gradient(135deg, #FF70D0, #C5A3FF, #70E6FF)',
        }}
      >
        <div className="rounded-full bg-mixx-navy-deep p-1">
          <Brain 
            size={size} 
            className="text-white"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(197,163,255,0.8))',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
