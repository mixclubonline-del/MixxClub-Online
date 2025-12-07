import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, DollarSign, TrendingUp, RefreshCw, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface LabelPartnership {
  id: string;
  label_name: string;
  label_type: string;
  partnership_status: string;
  revenue_share: number;
  contact_email: string;
  created_at: string;
}

interface Referral {
  id: string;
  referral_code: string;
  referrer_id: string;
  referred_user_id: string;
  status: string;
  commission_amount: number;
  created_at: string;
}

export default function AdminPartnerProgram() {
  const [partnerships, setPartnerships] = useState<LabelPartnership[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partnershipsRes, referralsRes] = await Promise.all([
        supabase.from('label_partnerships').select('*').order('created_at', { ascending: false }),
        supabase.from('distribution_referrals').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (partnershipsRes.data) setPartnerships(partnershipsRes.data);
      if (referralsRes.data) setReferrals(referralsRes.data);
    } catch (error) {
      toast.error('Failed to fetch partner data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'converted': return 'default';
      default: return 'outline';
    }
  };

  const totalCommissions = referrals.reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const activePartnerships = partnerships.filter(p => p.partnership_status === 'active').length;
  const convertedReferrals = referrals.filter(r => r.status === 'converted').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Partner Program</h1>
            <p className="text-muted-foreground mt-2">
              Manage label partnerships and referral programs
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Label Partners</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerships.length}</div>
              <p className="text-xs text-muted-foreground">{activePartnerships} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referrals.length}</div>
              <p className="text-xs text-muted-foreground">{convertedReferrals} converted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalCommissions.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {referrals.length > 0 ? ((convertedReferrals / referrals.length) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Referral success</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Label Partnerships</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : partnerships.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No partnerships found</p>
              ) : (
                <div className="space-y-4">
                  {partnerships.map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{partner.label_name}</p>
                        <p className="text-sm text-muted-foreground">{partner.contact_email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{partner.label_type}</Badge>
                          <Badge variant={getStatusColor(partner.partnership_status)}>
                            {partner.partnership_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{partner.revenue_share}%</p>
                        <p className="text-xs text-muted-foreground">Revenue share</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : referrals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No referrals found</p>
              ) : (
                <div className="space-y-3">
                  {referrals.slice(0, 10).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <code className="text-sm bg-muted px-2 py-1 rounded">{referral.referral_code}</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(referral.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(referral.status)}>{referral.status}</Badge>
                        {referral.commission_amount > 0 && (
                          <span className="text-sm font-medium text-primary">
                            ${referral.commission_amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
