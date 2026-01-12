import { useMemo } from "react";

const PathAmbience = () => {
  // Respect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const particles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + (i * 7),
      delay: i * 0.5,
      duration: 8 + (i % 4) * 2,
      size: 2 + (i % 3),
    })), []
  );

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-5 overflow-hidden"
      style={{ contain: 'layout' }}
    >
      {/* Flowing particles along the path - CSS animated */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary/40 animate-path-particle"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
      
      {/* Static glowing path lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <path
          d="M 50 0 Q 30 25, 50 50 T 50 100"
          stroke="url(#pathGradient)"
          strokeWidth="2"
          fill="none"
          className="translate-x-[50%]"
        />
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(262, 83%, 58%)" />
            <stop offset="50%" stopColor="hsl(220, 90%, 60%)" />
            <stop offset="100%" stopColor="hsl(180, 100%, 50%)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default PathAmbience;
