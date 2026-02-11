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

// Local fallback assets (always available, no network needed)
const LOCAL_ASSETS: Record<CoinType, string> = {
  earned: '/assets/economy/coin-earned.png',
  purchased: '/assets/economy/coin-purchased.png',
};

const COIN_STYLES: Record<CoinType, {
  gradient: string;
  glow: string;
  glowColor: string;
}> = {
  earned: {
    gradient: 'from-purple-500 via-violet-400 to-cyan-400',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.5)]',
    glowColor: 'rgba(6,182,212,0.4)',
  },
  purchased: {
    gradient: 'from-amber-400 via-yellow-400 to-amber-500',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    glowColor: 'rgba(251,191,36,0.4)',
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
  // Prefer Supabase-hosted asset, fall back to local file
  const assetUrl = getAssetUrl(type === 'earned' ? 'coin_earned' : 'coin_purchased') || LOCAL_ASSETS[type];
  const pixelSize = SIZE_MAP[size];
  const styles = COIN_STYLES[type];

  return (
    <motion.div
      className={cn(
        'relative rounded-full overflow-hidden',
        showGlow && styles.glow,
        className
      )}
      style={{ width: pixelSize, height: pixelSize }}
      animate={animated ? {
        scale: [1, 1.08, 1],
      } : undefined}
      transition={animated ? {
        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
      } : undefined}
    >
      <img
        src={assetUrl}
        alt={`${type} MixxCoin`}
        className="w-full h-full object-cover rounded-full"
        style={{
          filter: showGlow ? `drop-shadow(0 0 ${pixelSize * 0.15}px ${styles.glowColor})` : undefined,
        }}
      />
    </motion.div>
  );
}

export default MixxCoin;
