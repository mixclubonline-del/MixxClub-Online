import { motion } from "framer-motion";
import { useMemo } from "react";

const PathAmbience = () => {
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
      size: 2 + Math.random() * 4,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-5 overflow-hidden">
      {/* Flowing particles along the path */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/40"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ top: "-5%", opacity: 0 }}
          animate={{ 
            top: "105%", 
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Glowing path lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <motion.path
          d="M 50 0 Q 30 25, 50 50 T 50 100"
          stroke="url(#pathGradient)"
          strokeWidth="2"
          fill="none"
          className="translate-x-[50%]"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
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
