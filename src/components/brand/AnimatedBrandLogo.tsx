import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import all logo variants (optimized WebP)
import eqCrownLogo from '@/assets/brand/eq-crown-logo.webp';
import waveformCircuitLogo from '@/assets/brand/waveform-circuit-logo.webp';
import infinityCircuitLogo from '@/assets/brand/infinity-circuit-logo.webp';
import vinylWaveformLogo from '@/assets/brand/vinyl-waveform-logo.webp';

export type LogoVariant = 'crown' | 'waveform' | 'infinity' | 'vinyl';
export type LogoContext = 'hero' | 'navigation' | 'loading' | 'splash' | 'static';
export type GlowIntensity = 'none' | 'low' | 'medium' | 'high';

interface AnimatedBrandLogoProps {
  context?: LogoContext;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  cycleSpeed?: number;
  startVariant?: LogoVariant;
  showWordmark?: boolean;
  glowIntensity?: GlowIntensity;
  className?: string;
  onClick?: () => void;
}

const logoMap: Record<LogoVariant, string> = {
  crown: eqCrownLogo,
  waveform: waveformCircuitLogo,
  infinity: infinityCircuitLogo,
  vinyl: vinylWaveformLogo,
};

const logoOrder: LogoVariant[] = ['crown', 'waveform', 'infinity', 'vinyl'];

const sizeMap = {
  xs: { width: 32, height: 32, wordmark: 10 },
  sm: { width: 48, height: 48, wordmark: 14 },
  md: { width: 80, height: 80, wordmark: 18 },
  lg: { width: 120, height: 120, wordmark: 24 },
  xl: { width: 180, height: 180, wordmark: 32 },
};

const contextDefaults: Record<LogoContext, { cycleSpeed: number; glow: GlowIntensity; size: keyof typeof sizeMap }> = {
  hero: { cycleSpeed: 4000, glow: 'high', size: 'xl' },
  navigation: { cycleSpeed: 0, glow: 'low', size: 'sm' },
  loading: { cycleSpeed: 800, glow: 'medium', size: 'md' },
  splash: { cycleSpeed: 2000, glow: 'high', size: 'xl' },
  static: { cycleSpeed: 0, glow: 'none', size: 'md' },
};

const glowStyles: Record<GlowIntensity, string> = {
  none: '',
  low: 'drop-shadow-[0_0_8px_hsl(var(--primary)/0.3)]',
  medium: 'drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]',
  high: 'drop-shadow-[0_0_25px_hsl(var(--primary)/0.7)] drop-shadow-[0_0_50px_hsl(280_100%_70%/0.4)]',
};

export const AnimatedBrandLogo = ({
  context = 'static',
  size,
  cycleSpeed,
  startVariant = 'crown',
  showWordmark = false,
  glowIntensity,
  className = '',
  onClick,
}: AnimatedBrandLogoProps) => {
  const defaults = contextDefaults[context];
  const actualSize = size || defaults.size;
  const actualCycleSpeed = cycleSpeed ?? defaults.cycleSpeed;
  const actualGlow = glowIntensity ?? defaults.glow;
  
  const dimensions = sizeMap[actualSize];
  const [currentIndex, setCurrentIndex] = useState(logoOrder.indexOf(startVariant));
  const [isHovering, setIsHovering] = useState(false);

  // Auto-cycle effect
  useEffect(() => {
    if (actualCycleSpeed === 0 || (context === 'navigation' && !isHovering)) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logoOrder.length);
    }, actualCycleSpeed);

    return () => clearInterval(interval);
  }, [actualCycleSpeed, context, isHovering]);

  // Navigation hover cycle
  useEffect(() => {
    if (context !== 'navigation' || !isHovering) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logoOrder.length);
    }, 600);

    return () => clearInterval(interval);
  }, [context, isHovering]);

  const currentVariant = logoOrder[currentIndex];
  const currentLogo = logoMap[currentVariant];

  const getAnimationVariants = () => {
    switch (context) {
      case 'hero':
        return {
          enter: { opacity: 0, scale: 0.8, rotateY: -90 },
          center: { opacity: 1, scale: 1, rotateY: 0 },
          exit: { opacity: 0, scale: 0.8, rotateY: 90 },
        };
      case 'loading':
        return {
          enter: { opacity: 0, scale: 0.5, rotate: -180 },
          center: { opacity: 1, scale: 1, rotate: 0 },
          exit: { opacity: 0, scale: 0.5, rotate: 180 },
        };
      case 'splash':
        return {
          enter: { opacity: 0, scale: 1.5, filter: 'blur(20px)' },
          center: { opacity: 1, scale: 1, filter: 'blur(0px)' },
          exit: { opacity: 0, scale: 0.5, filter: 'blur(10px)' },
        };
      default:
        return {
          enter: { opacity: 0, x: -20 },
          center: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 20 },
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentVariant}
            src={currentLogo}
            alt="Mixxclub Logo"
            className={`absolute object-contain ${glowStyles[actualGlow]}`}
            style={{ 
              width: dimensions.width, 
              height: dimensions.height,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: context === 'loading' ? 0.3 : 0.5,
              ease: 'easeInOut',
            }}
          />
        </AnimatePresence>
        
        {/* Glow background layer */}
        {actualGlow !== 'none' && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary)/0.2) 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {showWordmark && (
        <motion.span
          className="font-bold text-foreground tracking-tight mt-2"
          style={{ fontSize: dimensions.wordmark }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Mixxclub
        </motion.span>
      )}
    </div>
  );
};

export default AnimatedBrandLogo;
