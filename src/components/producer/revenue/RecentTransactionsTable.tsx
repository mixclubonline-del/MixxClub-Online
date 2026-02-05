import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Disc3, Crown, Music, Handshake } from 'lucide-react';
import { format } from 'date-fns';
import type { ProducerRevenueAnalytics } from '@/hooks/useProducerRevenueStreams';

interface RecentTransactionsTableProps {
  transactions: ProducerRevenueAnalytics['recentTransactions'];
  loading: boolean;
}

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  lease: {
    icon: Disc3,
    color: 'bg-primary/20 text-primary',
    label: 'Lease',
  },
  exclusive: {
    icon: Crown,
    color: 'bg-purple-500/20 text-purple-400',
    label: 'Exclusive',
  },
  royalty: {
    icon: Music,
    color: 'bg-green-500/20 text-green-400',
    label: 'Royalty',
  },
  collab: {
    icon: Handshake,
    color: 'bg-amber-500/20 text-amber-400',
    label: 'Collab',
  },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  completed: { color: 'bg-green-500/20 text-green-400', label: 'Completed' },
  pending: { color: 'bg-amber-500/20 text-amber-400', label: 'Pending' },
  processing: { color: 'bg-blue-500/20 text-blue-400', label: 'Processing' },
  paid: { color: 'bg-green-500/20 text-green-400', label: 'Paid' },
};

export const RecentTransactionsTable = ({ transactions, loading }: RecentTransactionsTableProps) => {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No transactions yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const config = typeConfig[tx.type] || typeConfig.lease;
              const Icon = config.icon;
              const status = statusConfig[tx.status] || statusConfig.pending;

              return (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-foreground text-sm">
                        {config.label}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-foreground">
                      {tx.beatTitle || 'Unknown'}
                    </span>
                    {tx.artistName && (
                      <span className="text-muted-foreground text-sm ml-2">
                        • {tx.artistName}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(tx.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={status.color}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    +${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
