import { useMemo } from 'react';

interface ChamberAmbienceProps {
  isPlaying?: boolean;
}

export const ChamberAmbience = ({ isPlaying = false }: ChamberAmbienceProps) => {
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Generate LED positions deterministically
  const leds = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: 10 + (i * 7),
      top: 75 + (i % 3) * 5,
      delay: i * 0.3,
      duration: 2 + (i % 3),
      color: i % 4 === 0 ? 'hsl(var(--primary))' : i % 4 === 1 ? 'hsl(120, 60%, 50%)' : i % 4 === 2 ? 'hsl(45, 80%, 50%)' : 'hsl(0, 70%, 50%)'
    }))
  , []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ contain: 'layout' }}
    >
      {/* Equipment LED indicators */}
      {leds.map((led) => (
        <div
          key={led.id}
          className="absolute w-1.5 h-1.5 rounded-full animate-led-blink"
          style={{
            left: `${led.left}%`,
            top: `${led.top}%`,
            backgroundColor: led.color,
            boxShadow: `0 0 6px ${led.color}`,
            animationDelay: `${led.delay}s`,
            animationDuration: `${led.duration}s`,
            willChange: 'opacity',
            opacity: isPlaying ? 1 : 0.4,
          }}
        />
      ))}
      
      {/* VU Meter glow effect when playing */}
      {isPlaying && (
        <>
          <div 
            className="absolute bottom-[25%] left-[30%] w-2 h-16 animate-vu-meter"
            style={{
              background: 'linear-gradient(to top, hsl(120, 60%, 40%), hsl(45, 80%, 50%), hsl(0, 70%, 50%))',
              borderRadius: '2px',
              boxShadow: '0 0 10px hsl(120, 60%, 40%)',
            }}
          />
          <div 
            className="absolute bottom-[25%] left-[32%] w-2 h-16 animate-vu-meter"
            style={{
              background: 'linear-gradient(to top, hsl(120, 60%, 40%), hsl(45, 80%, 50%), hsl(0, 70%, 50%))',
              borderRadius: '2px',
              boxShadow: '0 0 10px hsl(120, 60%, 40%)',
              animationDelay: '0.1s',
            }}
          />
        </>
      )}
      
      {/* Subtle atmospheric haze */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};
