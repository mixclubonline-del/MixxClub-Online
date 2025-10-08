import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePoints } from '@/hooks/usePoints';
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const PointsLedger = () => {
  const { ledger, isLoading } = usePoints();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your recent points activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ledger?.map((transaction) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {transaction.points_delta > 0 ? (
                  <ArrowUpCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.created_at), 'PPp')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={transaction.points_delta > 0 ? 'default' : 'secondary'}
                  className="font-mono"
                >
                  {transaction.points_delta > 0 ? '+' : ''}{transaction.points_delta}
                </Badge>
              </div>
            </div>
          ))}
          {!ledger?.length && (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
