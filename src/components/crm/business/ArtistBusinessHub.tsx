import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, Receipt, Music, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserProjects } from '@/hooks/useUserProjects';

export const ArtistBusinessHub = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: projectBudgets = [] } = useUserProjects(user?.id, 'artist');

  useEffect(() => {
    if (user) loadPayments();
  }, [user]);

  const loadPayments = async () => {
    try {
      const paymentsRes = await (supabase as any)
        .from('payments')
        .select('id, amount, status, created_at')
        .eq('user_id', user!.id)
        .limit(10);
      
      setPayments(paymentsRes.data || []);
    } catch (error) {
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Business Overview</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Invested</CardTitle><DollarSign className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-3xl font-bold">${totalSpent.toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Services</CardTitle><Package className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-3xl font-bold">0</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Projects</CardTitle><Music className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-3xl font-bold">{projectBudgets.filter(p => p.status !== 'completed').length}</div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Payment History</CardTitle></CardHeader><CardContent><div className="space-y-4">{payments.length === 0 ? <div className="text-center p-8"><Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" /><p>No payments yet</p></div> : payments.map(payment => (<div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg"><div className="flex items-center gap-3"><div className={payment.status === 'completed' ? 'bg-green-500/10 p-2 rounded-lg' : 'bg-yellow-500/10 p-2 rounded-lg'}>{payment.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}</div><div><p className="font-medium">${Number(payment.amount).toFixed(2)}</p><p className="text-sm text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</p></div></div><Badge>{payment.status}</Badge></div>))}</div></CardContent></Card>
    </div>
  );
};