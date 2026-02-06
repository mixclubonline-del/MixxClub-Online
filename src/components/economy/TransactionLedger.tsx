import { motion } from 'framer-motion';
import { 
  ArrowDownCircle, 
  ShoppingCart, 
  Gift, 
  RefreshCcw,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMixxWallet, MixxTransaction } from '@/hooks/useMixxWallet';
import { formatDistanceToNow } from 'date-fns';
import { MixxCoin } from './MixxCoin';


const TRANSACTION_ICONS: Record<string, React.ElementType> = {
  EARN: TrendingUp,
  SPEND: ShoppingCart,
  PURCHASE: Wallet,
  GIFT_SENT: Gift,
  GIFT_RECEIVED: Gift,
  CASHOUT: ArrowDownCircle,
  REFUND: RefreshCcw,
};

const TRANSACTION_COLORS: Record<string, string> = {
  EARN: 'text-emerald-400',
  SPEND: 'text-red-400',
  PURCHASE: 'text-blue-400',
  GIFT_SENT: 'text-pink-400',
  GIFT_RECEIVED: 'text-pink-400',
  CASHOUT: 'text-amber-400',
  REFUND: 'text-purple-400',
};

const TRANSACTION_GLOWS: Record<string, string> = {
  EARN: 'rgba(52,211,153,0.12)',
  SPEND: 'rgba(248,113,113,0.12)',
  PURCHASE: 'rgba(96,165,250,0.12)',
  GIFT_SENT: 'rgba(244,114,182,0.12)',
  GIFT_RECEIVED: 'rgba(244,114,182,0.12)',
  CASHOUT: 'rgba(251,191,36,0.12)',
  REFUND: 'rgba(192,132,252,0.12)',
};

function TransactionRow({ transaction }: { transaction: MixxTransaction }) {
  const Icon = TRANSACTION_ICONS[transaction.transaction_type] || TrendingUp;
  const isPositive = ['EARN', 'GIFT_RECEIVED', 'REFUND', 'PURCHASE'].includes(transaction.transaction_type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
    >
      {/* Icon */}
      <div
        className="p-2 rounded-lg"
        style={{ background: TRANSACTION_GLOWS[transaction.transaction_type] || 'rgba(255,255,255,0.05)' }}
      >
        <Icon className={`h-4 w-4 ${TRANSACTION_COLORS[transaction.transaction_type]}`} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm capitalize">
            {transaction.transaction_type.toLowerCase().replace('_', ' ')}
          </span>
          <Badge variant="outline" className="text-[10px] border-white/10">
            {transaction.balance_type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {transaction.description || transaction.source}
        </p>
      </div>

      {/* Amount & Time */}
      <div className="text-right flex-shrink-0">
        <div className={`font-semibold flex items-center justify-end gap-1.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : '-'}{transaction.amount.toLocaleString()}
          <MixxCoin type={transaction.balance_type === 'earned' ? 'earned' : 'purchased'} size="xs" />
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
        </div>
      </div>
    </motion.div>
  );
}

export function TransactionLedger() {
  const { transactions, isLoading } = useMixxWallet();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div
        className="rounded-xl border border-white/[0.06] p-8 text-center"
        style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex justify-center mb-4">
          <MixxCoin type="earned" size="xl" showGlow />
        </div>
        <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
        <p className="text-muted-foreground">
          Complete missions and engage with the platform to earn your first coinz!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div
        className="rounded-xl border border-white/[0.06] overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Transaction History</h3>
            <Badge variant="secondary">{transactions.length} transactions</Badge>
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          <div className="p-2 space-y-1">
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}
