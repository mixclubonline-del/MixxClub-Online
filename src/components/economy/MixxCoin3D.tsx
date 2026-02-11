import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MixxCoin3DProps {
  type: 'earned' | 'purchased' | 'both';
  autoRotate?: boolean;
  className?: string;
}

const COIN_CONFIG = {
  earned: {
    src: '/assets/economy/coin-earned.png',
    alt: 'Earned MixxCoin — Soundwave Emblem',
    glowColor: 'rgba(6,182,212,0.4)',
    ringColor: 'rgba(139,92,246,0.3)',
    pulseColor: 'rgba(6,182,212,0.15)',
  },
  purchased: {
    src: '/assets/economy/coin-purchased.png',
    alt: 'Purchased MixxCoin — Crown Emblem',
    glowColor: 'rgba(251,191,36,0.4)',
    ringColor: 'rgba(217,119,6,0.3)',
    pulseColor: 'rgba(251,191,36,0.15)',
  },
};

function CoinVisual({
  type,
  autoRotate,
  style,
}: {
  type: 'earned' | 'purchased';
  autoRotate?: boolean;
  style?: React.CSSProperties;
}) {
  const config = COIN_CONFIG[type];

  return (
    <motion.div
      className="relative flex-shrink-0"
      style={{ ...style }}
      animate={autoRotate ? {
        y: [0, -8, 0],
        rotateY: [0, 12, 0, -12, 0],
      } : undefined}
      transition={autoRotate ? {
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        rotateY: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
      } : undefined}
    >
      {/* Outer glow pulse */}
      <motion.div
        className="absolute inset-[-20%] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${config.pulseColor} 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Ring glow */}
      <motion.div
        className="absolute inset-[-5%] rounded-full pointer-events-none"
        style={{
          boxShadow: `0 0 30px ${config.glowColor}, 0 0 60px ${config.ringColor}`,
        }}
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* The coin image */}
      <img
        src={config.src}
        alt={config.alt}
        className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
        style={{ filter: 'drop-shadow(0 0 20px ' + config.glowColor + ')' }}
      />
    </motion.div>
  );
}

function EnergyBridge() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      {/* Central flash */}
      <motion.div
        className="absolute w-24 h-24 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(6,182,212,0.15) 40%, transparent 70%)',
        }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Lightning streaks */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute h-[2px] bg-gradient-to-r from-cyan-400/0 via-white/80 to-amber-400/0"
          style={{
            width: '40%',
            transform: `rotate(${(i - 1) * 15}deg)`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scaleX: [0.7, 1.1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Particle sparkles between coins */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{
            left: `${30 + Math.random() * 40}%`,
            top: `${30 + Math.random() * 40}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            y: [0, (Math.random() - 0.5) * 20],
          }}
          transition={{
            duration: 1 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

export function MixxCoin3D({
  type,
  autoRotate = true,
  className,
}: MixxCoin3DProps) {
  if (type === 'both') {
    return (
      <div className={cn('relative w-full h-full', className)}>
        {/* Cosmic background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(6,182,212,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(251,191,36,0.08) 0%, transparent 50%), radial-gradient(ellipse at center, rgba(139,92,246,0.05) 0%, transparent 70%)',
          }}
        />

        {/* Star particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-[1px] h-[1px] rounded-full bg-white/60"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        {/* Dual coin layout */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 md:gap-8 px-8">
          <CoinVisual
            type="earned"
            autoRotate={autoRotate}
            style={{ width: '35%', maxWidth: 220 }}
          />
          <CoinVisual
            type="purchased"
            autoRotate={autoRotate}
            style={{ width: '35%', maxWidth: 220 }}
          />
        </div>

        {/* Energy bridge */}
        <EnergyBridge />
      </div>
    );
  }

  // Single coin mode
  return (
    <div className={cn('relative w-full h-full flex items-center justify-center', className)}>
      <div
        className="absolute inset-0"
        style={{
          background: type === 'earned'
            ? 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 60%)',
        }}
      />
      <CoinVisual
        type={type}
        autoRotate={autoRotate}
        style={{ width: '60%', maxWidth: 280 }}
      />
    </div>
  );
}

export default MixxCoin3D;
