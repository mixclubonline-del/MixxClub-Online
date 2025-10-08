import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useAudioReactivity } from '@/hooks/useAudioReactivity';

interface GlassSphereProps {
  size: number;
  color: string;
  icon?: LucideIcon;
  label?: string;
  bubbleCount?: number;
  glowIntensity?: number;
  parallaxX?: number;
  parallaxY?: number;
  isCenter?: boolean;
}

const generateBubbles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    size: Math.random() * 12 + 4,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2
  }));
};

export default function GlassSphere({
  size,
  color,
  icon: Icon,
  label,
  bubbleCount = 10,
  glowIntensity = 40,
  parallaxX = 0,
  parallaxY = 0,
  isCenter = false
}: GlassSphereProps) {
  const audioState = useAudioReactivity({ simulationMode: true });
  const bubbles = generateBubbles(bubbleCount);
  
  const pulseScale = isCenter ? 1 + (audioState.amplitude / 500) : 1 + (audioState.amplitude / 1000);

  return (
    <motion.div
      className="relative"
      style={{
        width: size,
        height: size,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`
      }}
      animate={{
        scale: audioState.isPlaying ? pulseScale : 1
      }}
      transition={{ duration: 0.1 }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          filter: `blur(${glowIntensity}px)`,
        }}
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main sphere with glass effect */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.4) 0%, transparent 50%),
            radial-gradient(circle at center, ${color} 0%, ${color}dd 100%)
          `,
          boxShadow: `
            inset 0 0 ${size * 0.3}px rgba(255, 255, 255, 0.3),
            inset 0 0 ${size * 0.2}px rgba(0, 0, 0, 0.3),
            0 0 ${glowIntensity}px ${color}
          `,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Inner bubbles */}
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute rounded-full"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
              background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2))`,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
            }}
            animate={{
              x: [0, Math.random() * 20 - 10, 0],
              y: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: bubble.duration,
              delay: bubble.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Icon or label */}
        {Icon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-1/2 h-1/2 text-white drop-shadow-2xl" strokeWidth={1.5} />
          </div>
        )}
        
        {isCenter && label && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="font-black text-white tracking-[0.3em] drop-shadow-2xl"
              style={{ fontSize: size * 0.15 }}
              animate={{
                textShadow: [
                  '0 0 20px rgba(255,255,255,0.8)',
                  '0 0 40px rgba(255,255,255,1)',
                  '0 0 20px rgba(255,255,255,0.8)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {label}
            </motion.span>
          </div>
        )}
      </div>

      {/* Highlight spot for extra glass effect */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          top: size * 0.15,
          left: size * 0.15,
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent)',
          filter: 'blur(10px)'
        }}
      />
    </motion.div>
  );
}
