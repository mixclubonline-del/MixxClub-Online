import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  ArrowDownRight,
  Wallet
} from 'lucide-react';
import { useEngineerPayouts, EngineerPayout } from '@/hooks/useEngineerPayouts';
import { format } from 'date-fns';

const statusConfig: Record<EngineerPayout['status'], { label: string; className: string; icon: typeof Clock }> = {
  pending: {
    label: 'Pending',
    className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: RefreshCw,
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: XCircle,
  },
};

interface EngineerPayoutsTableProps {
  limit?: number;
  showSummary?: boolean;
}

export const EngineerPayoutsTable = ({ limit, showSummary = true }: EngineerPayoutsTableProps) => {
  const { payouts, isLoading, error, summary } = useEngineerPayouts();

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Failed to load payouts: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const displayPayouts = limit ? payouts.slice(0, limit) : payouts;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Your Payouts
        </CardTitle>
        <CardDescription>
          Automatic 70/30 revenue share from completed projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        {showSummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-bold text-orange-400">
                ${summary.totalPending.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.pendingCount} payout{summary.pendingCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-xl font-bold text-blue-400">
                ${summary.totalProcessing.toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-bold text-green-400">
                ${summary.totalCompleted.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.completedCount} payout{summary.completedCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-xl font-bold text-foreground">
                ${(summary.totalCompleted + summary.totalPending + summary.totalProcessing).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Payouts Table */}
        {displayPayouts.length === 0 ? (
          <div className="text-center py-8">
            <ArrowDownRight className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No payouts yet</p>
            <p className="text-sm text-muted-foreground/70">
              Complete projects to start earning
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Fee (30%)</TableHead>
                  <TableHead className="text-right">Net (70%)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayPayouts.map((payout) => {
                  const config = statusConfig[payout.status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <TableRow key={payout.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(payout.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payout.project?.title || 'Direct Payment'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ${payout.gross_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-red-400">
                        -${payout.platform_fee.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-400">
                        ${payout.net_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={config.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {limit && payouts.length > limit && (
          <p className="text-sm text-center text-muted-foreground">
            Showing {limit} of {payouts.length} payouts
          </p>
        )}
      </CardContent>
    </Card>
  );
};
