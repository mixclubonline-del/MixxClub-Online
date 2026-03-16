import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, CheckCircle, XCircle, Loader2, AlertTriangle, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ContentReport {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
  reason: string;
  details: string | null;
  status: string;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export const AdminModerationQueue = () => {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-content-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as ContentReport[];
    },
    refetchInterval: 30000,
  });

  const resolveReport = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'resolved' | 'dismissed' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('content_reports')
        .update({
          status,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-reports'] });
      toast.success(status === 'resolved' ? 'Report resolved — content actioned' : 'Report dismissed');
    },
    onError: () => {
      toast.error('Failed to update report');
    },
  });

  const pendingReports = reports?.filter((r) => r.status === 'pending') || [];
  const resolvedReports = reports?.filter((r) => r.status !== 'pending') || [];

  const statusColor: Record<string, string> = {
    pending: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
    dismissed: 'bg-muted text-muted-foreground border-border/30',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Flag className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingReports.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resolvedReports.filter(r => r.status === 'resolved').length}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <XCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resolvedReports.filter(r => r.status === 'dismissed').length}</p>
              <p className="text-xs text-muted-foreground">Dismissed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" /> Pending Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReports.length === 0 ? (
            <div className="text-center py-8">
              <Inbox className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No pending reports — the community is clean</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between p-4 rounded-xl border border-orange-500/20 bg-orange-500/5"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize">
                        {report.content_type}
                      </Badge>
                      <Badge variant="outline" className={statusColor[report.status]}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{report.reason}</p>
                    {report.details && (
                      <p className="text-xs text-muted-foreground">{report.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Reported {format(new Date(report.created_at), 'MMM d, h:mm a')} •
                      Content ID: {report.content_id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 h-8 text-xs"
                      onClick={() => resolveReport.mutate({ id: report.id, status: 'dismissed' })}
                      disabled={resolveReport.isPending}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Dismiss
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1 h-8 text-xs"
                      onClick={() => resolveReport.mutate({ id: report.id, status: 'resolved' })}
                      disabled={resolveReport.isPending}
                    >
                      {resolveReport.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> Resolved Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resolvedReports.slice(0, 20).map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-border/30 bg-muted/10"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{report.content_type}</Badge>
                      <span className="text-sm text-foreground">{report.reason}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(report.created_at), 'MMM d')}
                      {report.resolved_at && ` • Resolved ${format(new Date(report.resolved_at), 'MMM d')}`}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusColor[report.status]}>
                    {report.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
