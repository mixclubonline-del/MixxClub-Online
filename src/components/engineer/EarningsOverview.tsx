import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Clock, Award } from 'lucide-react';

interface EarningsOverviewProps {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  totalBonuses: number;
}

export function EarningsOverview({
  totalEarnings,
  pendingEarnings,
  paidEarnings,
  totalBonuses,
}: EarningsOverviewProps) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-4 h-4 text-primary" />
            Total Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalEarnings.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4 text-orange-500" />
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${pendingEarnings.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">Awaiting payout</p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Paid Out
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${paidEarnings.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">Received</p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="w-4 h-4 text-primary" />
            Bonuses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalBonuses.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">From ratings</p>
        </CardContent>
      </Card>
    </div>
  );
}
