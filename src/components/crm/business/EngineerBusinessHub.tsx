import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, TrendingUp, Clock, CheckCircle, 
  AlertCircle, Download, Award, Calendar 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const EngineerBusinessHub = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    totalBonuses: 0,
    availableBalance: 0,
    thisMonthEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEarningsData();
    }
  }, [user]);

  const loadEarningsData = async () => {
    try {
      const { data: earningsData, error: earningsError } = await supabase
        .from('engineer_earnings')
        .select('*')
        .eq('engineer_id', user?.id)
        .order('created_at', { ascending: false });

      if (earningsError) throw earningsError;

      const total = earningsData?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;
      const pending = earningsData?.filter(e => e.status === 'pending').reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;
      const paid = earningsData?.filter(e => e.status === 'paid').reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;
      const bonuses = 0;
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = earningsData?.filter(e => 
        new Date(e.created_at) >= firstDayOfMonth
      ).reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;

      setStats({
        totalEarnings: total,
        pendingEarnings: pending,
        paidEarnings: paid,
        totalBonuses: bonuses,
        availableBalance: pending,
        thisMonthEarnings: thisMonth
      });

      setEarnings(earningsData || []);
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = () => {
    if (stats.availableBalance < 50) {
      toast.error('Minimum withdrawal amount is $50');
      return;
    }
    toast.info('Withdrawal feature coming soon!');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-12 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Earnings & Payouts</h2>
        <p className="text-muted-foreground">
          View your earnings and request withdrawals
        </p>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Balance
            </CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              ${stats.availableBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month
            </CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.thisMonthEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Paid
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.paidEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bonuses Earned
            </CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.totalBonuses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Performance bonuses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 bg-muted/50 rounded-lg">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                ${stats.availableBalance.toFixed(2)}
              </h3>
              <p className="text-sm text-muted-foreground">
                Available for withdrawal (minimum $50)
              </p>
            </div>
            <Button 
              size="lg"
              onClick={handleWithdrawal}
              disabled={stats.availableBalance < 50}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Withdraw Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earnings.length === 0 ? (
              <div className="text-center p-8">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No earnings yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete projects to start earning
                </p>
              </div>
            ) : (
              earnings.map(earning => (
                <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      earning.status === 'paid' 
                        ? 'bg-green-500/10' 
                        : earning.status === 'pending'
                        ? 'bg-yellow-500/10'
                        : 'bg-gray-500/10'
                    }`}>
                      {earning.status === 'paid' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : earning.status === 'pending' ? (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        Project Earnings
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(earning.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ${Number(earning.amount).toFixed(2)}
                    </p>
                    <Badge 
                      variant={earning.status === 'paid' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {earning.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};