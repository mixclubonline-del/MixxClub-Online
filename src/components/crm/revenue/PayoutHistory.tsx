import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CheckCircle2, XCircle, Loader2, CreditCard } from 'lucide-react';
import { PayoutRecord } from '@/hooks/useRevenueStreams';
import { format } from 'date-fns';

interface PayoutHistoryProps {
  payouts: PayoutRecord[];
  loading: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
  },
  processing: {
    label: 'Processing',
    icon: Loader2,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
  },
};

export const PayoutHistory = ({ payouts, loading }: PayoutHistoryProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-muted/30 border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <Card className="bg-muted/30 border-border">
        <CardContent className="p-8 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-semibold text-foreground mb-2">No Payouts Yet</h4>
          <p className="text-sm text-muted-foreground">
            Your payout history will appear here once you make your first withdrawal.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {payouts.map((payout) => {
        const config = statusConfig[payout.status];
        const StatusIcon = config.icon;
        
        return (
          <Card 
            key={payout.id} 
            className={`bg-muted/30 border-border hover:${config.borderColor} transition-colors`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                    <StatusIcon className={`w-5 h-5 ${config.color} ${payout.status === 'processing' ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      ${payout.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(payout.date), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${config.bgColor} ${config.color} border ${config.borderColor}`}>
                    {config.label}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {payout.method}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
