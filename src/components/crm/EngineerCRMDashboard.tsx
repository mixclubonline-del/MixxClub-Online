import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Briefcase, CheckCircle2, Star, Loader2, AlertCircle, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SessionInvitationsList } from '@/components/collaboration/SessionInvitationsList';
import { PublicSessionBrowser } from '@/components/collaboration/PublicSessionBrowser';
import { StripeConnectCard } from '@/components/engineer/StripeConnectCard';
import { EngineerPayoutsTable } from '@/components/engineer/EngineerPayoutsTable';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { useEngineerPayouts } from '@/hooks/useEngineerPayouts';

export const EngineerCRMDashboard = () => {
  const { user } = useAuth();
  const { canReceivePayouts, isLoading: stripeLoading } = useStripeConnect();
  const { summary: payoutSummary, pendingPayouts } = useEngineerPayouts();

  // Fetch earnings stats
  const { data: earningsStats, isLoading: earningsLoading } = useQuery({
    queryKey: ['engineer-earnings-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('engineer_earnings')
        .select('amount, status')
        .eq('engineer_id', user.id);
      
      if (error) throw error;
      
      const total = data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const pending = data?.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const paid = data?.filter(e => e.status === 'paid').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      
      return { total, pending, paid, count: data?.length || 0 };
    },
    enabled: !!user?.id,
  });

  // Fetch work stats
  const { data: workStats, isLoading: workLoading } = useQuery({
    queryKey: ['engineer-work-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('engineer_deliverables')
        .select('status')
        .eq('engineer_id', user.id);
      
      if (error) throw error;
      
      const active = data?.filter(d => d.status === 'in_progress' || d.status === 'pending').length || 0;
      const completed = data?.filter(d => d.status === 'completed' || d.status === 'approved').length || 0;
      
      return { active, completed, total: data?.length || 0 };
    },
    enabled: !!user?.id,
  });

  // Fetch rating
  const { data: profileData } = useQuery({
    queryKey: ['engineer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('engineer_profiles')
        .select('rating, completed_projects')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data;
    },
    enabled: !!user?.id,
  });

  const isLoading = earningsLoading || workLoading;

  return (
    <div className="space-y-6">
      {/* Stripe Connect Warning if not connected */}
      {!stripeLoading && !canReceivePayouts && (
        <StripeConnectWizard />
      )}

      {/* Pending Payouts Alert */}
      {pendingPayouts.length > 0 && canReceivePayouts && (
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-orange-400" />
              <div>
                <p className="font-medium text-orange-400">
                  ${payoutSummary.totalPending.toFixed(2)} Pending Payout
                </p>
                <p className="text-sm text-muted-foreground">
                  {pendingPayouts.length} payout{pendingPayouts.length !== 1 ? 's' : ''} awaiting processing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-400">
                  ${earningsStats?.total.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {earningsStats?.count || 0} transactions
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Work
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{workStats?.active || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Projects in progress
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Deliverables
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{workStats?.completed || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Successfully delivered
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rating
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profileData?.rating?.toFixed(1) || '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profileData?.completed_projects || 0} projects completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payouts Preview */}
      {canReceivePayouts && (
        <EngineerPayoutsTable limit={5} showSummary={false} />
      )}

      {/* Session Invitations */}
      <SessionInvitationsList />
      
      {/* Public Session Browser */}
      <PublicSessionBrowser />
    </div>
  );
};