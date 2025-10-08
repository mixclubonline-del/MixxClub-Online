import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const generateParticles = (count: number): Particle[] => {
  const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
};

const particles = generateParticles(40);

export default function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Nebula background layers */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(217, 70, 239, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Floating ambient orbs */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 4}px ${particle.color}`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Subtle perspective grid */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(99, 102, 241, 0.3) 25%, rgba(99, 102, 241, 0.3) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.3) 75%, rgba(99, 102, 241, 0.3) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(99, 102, 241, 0.3) 25%, rgba(99, 102, 241, 0.3) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.3) 75%, rgba(99, 102, 241, 0.3) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}
