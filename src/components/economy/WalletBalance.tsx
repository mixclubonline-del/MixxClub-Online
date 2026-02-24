import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMixxWallet } from '@/hooks/useMixxWallet';
import { MixxCoin } from './MixxCoin';

export function WalletBalance() {
  const { wallet, totalBalance, isLoading } = useMixxWallet();

  if (isLoading) {
    return (
      <div
        className="rounded-xl border border-white/[0.06] p-6"
        style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!wallet) {
    return null;
  }

  const stats = [
    {
      label: 'Earned',
      value: wallet.earned_balance,
      icon: TrendingUp,
      color: 'text-emerald-400',
      glow: 'rgba(52,211,153,0.12)',
    },
    {
      label: 'Purchased',
      value: wallet.purchased_balance,
      icon: ShoppingBag,
      color: 'text-blue-400',
      glow: 'rgba(96,165,250,0.12)',
    },
    {
      label: 'Gifted',
      value: wallet.total_gifted,
      icon: Gift,
      color: 'text-pink-400',
      glow: 'rgba(244,114,182,0.12)',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="relative rounded-xl border border-primary/15 p-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(var(--primary-rgb, 168,85,247), 0.08) 0%, rgba(var(--accent-rgb, 244,114,182), 0.05) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Decorative ambient glows */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Total Balance */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase mb-1">Total Balance</p>
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <MixxCoin type="earned" size="lg" animated showGlow />
                  <span className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    {totalBalance.toLocaleString()}
                  </span>
                </motion.div>
                <Badge variant="secondary" className="text-xs">
                  MixxCoinz
                </Badge>
              </div>
            </div>
          </div>

          {/* Balance Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-lg transition-all hover:scale-105 border border-white/[0.04]"
                style={{ background: stat.glow }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className={`text-lg font-semibold ${stat.color}`}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Lifetime Stats */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Earned: {wallet.total_earned.toLocaleString()}</span>
            <span>Total Spent: {wallet.total_spent.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
