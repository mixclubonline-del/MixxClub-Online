import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useMixxWallet } from '@/hooks/useMixxWallet';
import { useMissions } from '@/hooks/useMissions';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MixxCoin } from './MixxCoin';

interface WalletIndicatorProps {
  variant?: 'compact' | 'mini' | 'full';
  className?: string;
}

export function WalletIndicator({ variant = 'compact', className }: WalletIndicatorProps) {
  const navigate = useNavigate();
  const { wallet, totalBalance, isLoading } = useMixxWallet();
  const { unclaimedRewards } = useMissions();

  const handleClick = () => {
    navigate('/economy');
  };

  const formatBalance = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    );
  }

  if (!wallet) return null;

  const hasRewards = unclaimedRewards > 0;

  // Mini variant - icon only with tooltip
  if (variant === 'mini') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              'relative flex items-center justify-center h-8 w-8 rounded-full',
              'bg-amber-500/10 hover:bg-amber-500/20 transition-colors',
              hasRewards && 'animate-pulse',
              className
            )}
          >
            <MixxCoin type="earned" size="sm" animated />
            {hasRewards && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-medium">
            <MixxCoin type="earned" size="xs" />
            {totalBalance.toLocaleString()} MixxCoinz
          </div>
          {hasRewards && (
            <div className="flex items-center gap-1 text-xs text-amber-400">
              <Sparkles className="h-3 w-3" />
              {unclaimedRewards} rewards to claim!
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Full variant - shows earned/purchased split
  if (variant === 'full') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-xl',
          'bg-gradient-to-r from-amber-500/10 to-amber-600/5',
          'border border-amber-500/20 hover:border-amber-500/40',
          'transition-all duration-200 hover:scale-[1.02]',
          className
        )}
      >
        <div className="p-2 rounded-lg bg-amber-500/20">
          <MixxCoin type="earned" size="md" animated />
        </div>
        <div className="flex flex-col items-start">
          <AnimatePresence mode="wait">
            <motion.span
              key={totalBalance}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-lg font-bold text-amber-400"
            >
              {formatBalance(totalBalance)}
            </motion.span>
          </AnimatePresence>
          <span className="text-xs text-muted-foreground">MixxCoinz</span>
        </div>
        {hasRewards && (
          <div className="ml-2 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
            <Sparkles className="h-3 w-3" />
            <span className="text-xs font-medium">{unclaimedRewards}</span>
          </div>
        )}
      </button>
    );
  }

  // Compact variant (default) - for navigation bars
  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-amber-500/10 hover:bg-amber-500/20',
        'border border-amber-500/20 hover:border-amber-500/40',
        'transition-all duration-200',
        hasRewards && 'ring-2 ring-amber-500/30 ring-offset-2 ring-offset-background',
        className
      )}
    >
      <MixxCoin type="earned" size="sm" animated />
      <AnimatePresence mode="wait">
        <motion.span
          key={totalBalance}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-sm font-semibold text-amber-400"
        >
          {formatBalance(totalBalance)}
        </motion.span>
      </AnimatePresence>
      {hasRewards && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full flex items-center justify-center"
        >
          <Sparkles className="h-2.5 w-2.5 text-white" />
        </motion.div>
      )}
    </button>
  );
}
