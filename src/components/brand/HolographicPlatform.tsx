import { motion } from 'framer-motion';

interface HolographicPlatformProps {
  size?: number;
  rings?: number;
  className?: string;
}

export const HolographicPlatform = ({ 
  size = 400, 
  rings = 8,
  className = '' 
}: HolographicPlatformProps) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: rings }).map((_, i) => {
        const scale = 1 - (i / rings) * 0.6;
        const opacity = 0.15 - (i / rings) * 0.1;
        
        return (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2"
            style={{
              borderImage: 'linear-gradient(90deg, #FF70D0, #C5A3FF, #70E6FF) 1',
              opacity,
              transform: `scale(${scale})`,
            }}
            animate={{
              scale: [scale, scale * 1.02, scale],
              opacity: [opacity, opacity * 1.3, opacity],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        );
      })}
      
      {/* Center glow */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,112,208,0.2) 0%, rgba(197,163,255,0.1) 40%, transparent 70%)',
        }}
      />
    </div>
  );
};
