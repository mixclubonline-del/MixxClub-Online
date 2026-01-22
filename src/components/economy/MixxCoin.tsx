import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEconomyAssets } from '@/hooks/useEconomyAssets';

export type CoinType = 'earned' | 'purchased';
export type CoinSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

interface MixxCoinProps {
  type: CoinType;
  size?: CoinSize;
  animated?: boolean;
  showGlow?: boolean;
  className?: string;
}

const SIZE_MAP: Record<CoinSize, number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
  hero: 128,
};

const COIN_STYLES: Record<CoinType, {
  gradient: string;
  glow: string;
  ring: string;
  emblem: string;
}> = {
  earned: {
    gradient: 'from-purple-500 via-violet-400 to-cyan-400',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.5)]',
    ring: 'border-purple-400/50',
    emblem: 'text-cyan-300',
  },
  purchased: {
    gradient: 'from-amber-400 via-yellow-400 to-amber-500',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
    ring: 'border-amber-400/50',
    emblem: 'text-amber-200',
  },
};

export function MixxCoin({
  type,
  size = 'md',
  animated = false,
  showGlow = true,
  className,
}: MixxCoinProps) {
  const { getAssetUrl } = useEconomyAssets();
  const assetUrl = getAssetUrl(type === 'earned' ? 'coin_earned' : 'coin_purchased');
  const pixelSize = SIZE_MAP[size];
  const styles = COIN_STYLES[type];

  // If we have a generated asset, use it
  if (assetUrl) {
    return (
      <motion.div
        className={cn(
          'relative rounded-full overflow-hidden',
          showGlow && styles.glow,
          className
        )}
        style={{ width: pixelSize, height: pixelSize }}
        animate={animated ? {
          rotate: [0, 360],
          scale: [1, 1.05, 1],
        } : undefined}
        transition={animated ? {
          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        } : undefined}
      >
        <img
          src={assetUrl}
          alt={`${type} MixxCoin`}
          className="w-full h-full object-cover"
        />
      </motion.div>
    );
  }

  // CSS Fallback - Procedural coin visualization
  return (
    <motion.div
      className={cn(
        'relative rounded-full overflow-hidden',
        showGlow && styles.glow,
        className
      )}
      style={{ width: pixelSize, height: pixelSize }}
      animate={animated ? {
        rotate: [0, 360],
      } : undefined}
      transition={animated ? {
        rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
      } : undefined}
    >
      {/* Base coin */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-gradient-to-br',
          styles.gradient
        )}
      />

      {/* Inner ring detail */}
      <div
        className={cn(
          'absolute inset-[10%] rounded-full border-2',
          styles.ring,
          'bg-gradient-to-br from-white/10 to-transparent'
        )}
      />

      {/* Frequency rings for earned / Gem facets for purchased */}
      {type === 'earned' ? (
        <>
          {/* Frequency rings */}
          <motion.div
            className="absolute inset-[20%] rounded-full border border-cyan-400/40"
            animate={animated ? { scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] } : undefined}
            transition={animated ? { duration: 2, repeat: Infinity } : undefined}
          />
          <motion.div
            className="absolute inset-[30%] rounded-full border border-purple-400/40"
            animate={animated ? { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] } : undefined}
            transition={animated ? { duration: 2.5, repeat: Infinity } : undefined}
          />
        </>
      ) : (
        <>
          {/* Gem facet lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[60%] h-[1px] bg-gradient-to-r from-transparent via-amber-200/60 to-transparent rotate-45" />
            <div className="absolute w-[60%] h-[1px] bg-gradient-to-r from-transparent via-amber-200/60 to-transparent -rotate-45" />
            <div className="absolute w-[60%] h-[1px] bg-gradient-to-r from-transparent via-amber-200/60 to-transparent rotate-90" />
          </div>
        </>
      )}

      {/* Center emblem - M */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          styles.emblem
        )}
        style={{ fontSize: pixelSize * 0.35 }}
      >
        <span className="font-bold drop-shadow-lg">M</span>
      </div>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"
        animate={animated ? {
          opacity: [0.3, 0.5, 0.3],
        } : undefined}
        transition={animated ? {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        } : undefined}
      />
    </motion.div>
  );
}

export default MixxCoin;
