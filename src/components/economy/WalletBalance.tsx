import { motion } from 'framer-motion';
import { Coins, TrendingUp, ShoppingBag, Gift } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMixxWallet } from '@/hooks/useMixxWallet';

export function WalletBalance() {
  const { wallet, totalBalance, isLoading } = useMixxWallet();

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-12 w-48" />
      </Card>
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
      bgColor: 'bg-emerald-500/10'
    },
    { 
      label: 'Purchased', 
      value: wallet.purchased_balance, 
      icon: ShoppingBag, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Gifted', 
      value: wallet.total_gifted, 
      icon: Gift, 
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          {/* Total Balance */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Total Balance</p>
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Coins className="h-8 w-8 text-amber-400" />
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
                className={`p-3 rounded-lg ${stat.bgColor} transition-all hover:scale-105`}
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
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Earned: {wallet.total_earned.toLocaleString()}</span>
            <span>Total Spent: {wallet.total_spent.toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
