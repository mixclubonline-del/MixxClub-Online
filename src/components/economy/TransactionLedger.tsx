import { motion } from 'framer-motion';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ShoppingCart, 
  Gift, 
  RefreshCcw,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { Card } from '@/components/ui/card';
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

const TRANSACTION_BG: Record<string, string> = {
  EARN: 'bg-emerald-500/10',
  SPEND: 'bg-red-500/10',
  PURCHASE: 'bg-blue-500/10',
  GIFT_SENT: 'bg-pink-500/10',
  GIFT_RECEIVED: 'bg-pink-500/10',
  CASHOUT: 'bg-amber-500/10',
  REFUND: 'bg-purple-500/10',
};

function TransactionRow({ transaction }: { transaction: MixxTransaction }) {
  const Icon = TRANSACTION_ICONS[transaction.transaction_type] || TrendingUp;
  const isPositive = ['EARN', 'GIFT_RECEIVED', 'REFUND', 'PURCHASE'].includes(transaction.transaction_type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
    >
      {/* Icon */}
      <div className={`p-2 rounded-lg ${TRANSACTION_BG[transaction.transaction_type]}`}>
        <Icon className={`h-4 w-4 ${TRANSACTION_COLORS[transaction.transaction_type]}`} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm capitalize">
            {transaction.transaction_type.toLowerCase().replace('_', ' ')}
          </span>
          <Badge variant="outline" className="text-[10px]">
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
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <MixxCoin type="earned" size="xl" showGlow />
        </div>
        <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
        <p className="text-muted-foreground">
          Complete missions and engage with the platform to earn your first coinz!
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-border">
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
    </Card>
  );
}
