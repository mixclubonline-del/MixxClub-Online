import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Play,
  History,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

interface PayoutStats {
  pendingCount: number;
  pendingAmount: number;
  eligibleCount: number;
  eligibleAmount: number;
}

interface ProcessingLog {
  id: string;
  run_id: string;
  started_at: string;
  completed_at: string | null;
  trigger_source: string;
  payouts_processed: number;
  payouts_failed: number;
  payouts_skipped: number;
  total_amount_transferred: number;
}

export const PayoutProcessingControl: React.FC = () => {
  const [stats, setStats] = useState<PayoutStats>({
    pendingCount: 0,
    pendingAmount: 0,
    eligibleCount: 0,
    eligibleAmount: 0,
  });
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch pending payouts
      const { data: pending, error: pendingError } = await supabase
        .from('engineer_payouts')
        .select('id, net_amount, eligible_for_payout_at')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      const now = new Date();
      const eligible = pending?.filter(p => 
        p.eligible_for_payout_at && new Date(p.eligible_for_payout_at) <= now
      ) || [];

      setStats({
        pendingCount: pending?.length || 0,
        pendingAmount: pending?.reduce((sum, p) => sum + (p.net_amount || 0), 0) || 0,
        eligibleCount: eligible.length,
        eligibleAmount: eligible.reduce((sum, p) => sum + (p.net_amount || 0), 0),
      });

      // Fetch recent processing logs
      const { data: logsData, error: logsError } = await supabase
        .from('payout_processing_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;
      setLogs(logsData || []);

    } catch (err) {
      console.error('Error fetching payout stats:', err);
      toast.error('Failed to load payout statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualProcess = async () => {
    if (stats.eligibleCount === 0) {
      toast.info('No eligible payouts to process');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('scheduled-payout-processor', {
        body: { trigger_source: 'admin_manual' },
      });

      if (error) throw error;

      toast.success(
        `Processing complete: ${data.processed} processed, ${data.failed} failed, ${data.skipped} skipped`
      );
      
      // Refresh stats
      fetchStats();
    } catch (err) {
      console.error('Error processing payouts:', err);
      toast.error('Failed to process payouts');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTriggerBadge = (source: string) => {
    switch (source) {
      case 'n8n_schedule':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Scheduled</Badge>;
      case 'admin_manual':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">Manual</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/30">API</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ready to Process</p>
                <p className="text-2xl font-bold">{stats.eligibleCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eligible Amount</p>
                <p className="text-2xl font-bold">${stats.eligibleAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Control */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Payout Processing
              </CardTitle>
              <CardDescription>
                Process eligible engineer payouts manually or view scheduled runs
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStats}
                disabled={isProcessing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleManualProcess}
                disabled={isProcessing || stats.eligibleCount === 0}
                className="bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Process Now ({stats.eligibleCount})
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stats.eligibleCount === 0 && stats.pendingCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
              <Clock className="h-5 w-5 text-yellow-400" />
              <p className="text-sm text-yellow-300">
                {stats.pendingCount} payouts are in the 3-day holding period for fraud protection
              </p>
            </div>
          )}

          {/* Processing History */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-medium">Recent Processing Runs</h4>
            </div>

            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No processing runs yet
              </p>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-lg bg-background/50 border border-border/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTriggerBadge(log.trigger_source)}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.run_id.slice(0, 8)}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Processed</p>
                          <p className="font-medium text-green-400">{log.payouts_processed}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Failed</p>
                          <p className="font-medium text-red-400">{log.payouts_failed}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Skipped</p>
                          <p className="font-medium text-yellow-400">{log.payouts_skipped}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-medium text-primary">${log.total_amount_transferred.toFixed(2)}</p>
                        </div>
                      </div>

                      {log.completed_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Completed: {format(new Date(log.completed_at), 'MMM d, yyyy HH:mm:ss')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      {/* n8n Integration Info */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            Automated Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure an n8n workflow to automatically call the <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">scheduled-payout-processor</code> function 
            daily at 6 AM UTC. Use trigger source <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">n8n_schedule</code> for proper logging.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
