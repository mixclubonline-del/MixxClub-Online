import { motion } from 'framer-motion';

interface LogoAnimationsProps {
  isActive: boolean;
  amplitude: number;
  frequency: number;
  beats: number[];
}

export const LogoAnimations = ({ isActive, amplitude, frequency, beats }: LogoAnimationsProps) => {
  const pulseIntensity = amplitude / 100;
  const rotationSpeed = frequency / 10000;

  return (
    <>
      {/* Audio-reactive glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(var(--primary) / ${0.1 + pulseIntensity * 0.3}) 0%, 
            hsl(var(--primary) / ${0.05 + pulseIntensity * 0.2}) 50%, 
            transparent 70%)`,
          filter: `blur(${8 + pulseIntensity * 12}px)`
        }}
        animate={{
          scale: [1, 1.2 + pulseIntensity * 0.5, 1],
          rotate: isActive ? [0, rotationSpeed * 360] : 0,
        }}
        transition={{
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 10, repeat: Infinity, ease: "linear" }
        }}
      />

      {/* Beat-reactive particles */}
      {beats.map((beat, index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2 bg-primary/60 rounded-full"
          style={{
            left: `${50 + Math.cos((index / 8) * Math.PI * 2) * 60}%`,
            top: `${50 + Math.sin((index / 8) * Math.PI * 2) * 60}%`,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [0.5, 1 + (beat / 100), 0.5],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            ease: "easeOut",
            delay: index * 0.1
          }}
        />
      ))}

      {/* Frequency visualization bars */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-1">
          {Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              className="w-0.5 bg-primary/40 rounded-full"
              style={{
                height: `${8 + (beats[i % 8] || 0) * 0.3}px`,
              }}
              animate={{
                scaleY: [0.5, 1 + (amplitude / 100), 0.5],
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.05
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};