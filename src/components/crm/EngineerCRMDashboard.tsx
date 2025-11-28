import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SessionInvitationsList } from '@/components/collaboration/SessionInvitationsList';
import { PublicSessionBrowser } from '@/components/collaboration/PublicSessionBrowser';
import { 
  DollarSign, 
  TrendingUp, 
  Award, 
  Activity, 
  Loader2,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';

export const EngineerCRMDashboard = () => {
  const { user } = useAuth();

  // Fetch earnings stats
  const { data: earningsStats, isLoading: earningsLoading } = useQuery({
    queryKey: ['engineer-earnings-stats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('engineer_earnings')
        .select('amount, status, created_at')
        .eq('engineer_id', user?.id);

      const total = data?.reduce((sum, e) => sum + e.amount, 0) || 0;
      const pending = data?.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0) || 0;
      const paid = data?.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0) || 0;

      return { total, pending, paid, count: data?.length || 0 };
    },
    enabled: !!user?.id,
  });

  // Fetch work stats
  const { data: workStats, isLoading: workLoading } = useQuery({
    queryKey: ['engineer-work-stats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('engineer_deliverables')
        .select('status')
        .eq('engineer_id', user?.id);

      const active = data?.filter(d => d.status === 'pending' || d.status === 'in_progress').length || 0;
      const completed = data?.filter(d => d.status === 'approved').length || 0;
      const total = data?.length || 0;

      return { active, completed, total };
    },
    enabled: !!user?.id,
  });

  // Fetch profile rating
  const { data: profile } = useQuery({
    queryKey: ['engineer-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('engineer_profiles')
        .select('rating, completed_projects')
        .eq('user_id', user?.id)
        .single();

      return data;
    },
    enabled: !!user?.id,
  });

  const isLoading = earningsLoading || workLoading;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ${earningsStats?.total.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {earningsStats?.count || 0} transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Work</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{workStats?.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {workStats?.total || 0} total projects
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{workStats?.completed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  deliverables approved
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.rating ? `${profile.rating.toFixed(1)} ⭐` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {profile?.completed_projects || 0} projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Earnings Alert */}
      {earningsStats && earningsStats.pending > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="font-medium">Pending Earnings</p>
              <p className="text-sm text-muted-foreground">
                ${earningsStats.pending.toFixed(2)} awaiting payment
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Session Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionInvitationsList />
        </CardContent>
      </Card>

      {/* Browse Public Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Public Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <PublicSessionBrowser />
        </CardContent>
      </Card>
    </div>
  );
};