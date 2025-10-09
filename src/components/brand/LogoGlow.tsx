import { motion } from 'framer-motion';

interface LogoGlowProps {
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const LogoGlow = ({ 
  intensity = 'medium',
  className = '' 
}: LogoGlowProps) => {
  const opacityMap = {
    low: 0.15,
    medium: 0.3,
    high: 0.5,
  };

  const sizeMap = {
    low: '60%',
    medium: '80%',
    high: '100%',
  };

  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none ${className}`}
      animate={{
        opacity: [opacityMap[intensity] * 0.7, opacityMap[intensity], opacityMap[intensity] * 0.7],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          width: sizeMap[intensity],
          height: sizeMap[intensity],
          background: 'radial-gradient(circle, rgba(255,112,208,0.4) 0%, rgba(197,163,255,0.3) 40%, rgba(112,230,255,0.4) 100%)',
        }}
      />
    </motion.div>
  );
};
