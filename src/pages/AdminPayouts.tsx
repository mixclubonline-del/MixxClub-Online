import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Clock, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PayoutRequest {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  notes: string | null;
  requested_at: string;
  processed_at: string | null;
}

interface EngineerEarning {
  id: string;
  engineer_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  project_id: string | null;
}

export default function AdminPayouts() {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [earnings, setEarnings] = useState<EngineerEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payoutsRes, earningsRes] = await Promise.all([
        supabase
          .from('payout_requests')
          .select('*')
          .order('requested_at', { ascending: false }),
        supabase
          .from('engineer_earnings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      if (payoutsRes.error) throw payoutsRes.error;
      if (earningsRes.error) throw earningsRes.error;

      setPayoutRequests(payoutsRes.data || []);
      setEarnings(earningsRes.data || []);
    } catch (error: any) {
      console.error('Error fetching payout data:', error);
      toast.error('Failed to load payout data');
    } finally {
      setLoading(false);
    }
  };

  const updatePayoutStatus = async (payoutId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({ 
          status: newStatus,
          processed_at: newStatus === 'completed' || newStatus === 'rejected' ? new Date().toISOString() : null
        })
        .eq('id', payoutId);

      if (error) throw error;
      toast.success(`Payout ${newStatus}`);
      fetchData();
    } catch (error: any) {
      console.error('Error updating payout:', error);
      toast.error('Failed to update payout status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'processing': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredPayouts = payoutRequests.filter(payout => {
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    const matchesSearch = payout.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payout.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    totalRequests: payoutRequests.length,
    pending: payoutRequests.filter(p => p.status === 'pending').length,
    completed: payoutRequests.filter(p => p.status === 'completed').length,
    totalPending: payoutRequests
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    totalPaid: payoutRequests
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    totalEarnings: earnings.reduce((sum, e) => sum + Number(e.amount), 0),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payouts Management</h1>
            <p className="text-muted-foreground">
              Manage engineer payout requests and earnings
            </p>
          </div>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                ${stats.totalPending.toFixed(2)} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                ${stats.totalPaid.toFixed(2)} paid out
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Engineer Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{earnings.length} records</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">Payout Requests</TabsTrigger>
            <TabsTrigger value="earnings">Engineer Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredPayouts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  No payout requests found
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-mono text-xs">
                          {payout.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {payout.user_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          ${Number(payout.amount).toFixed(2)} {payout.currency}
                        </TableCell>
                        <TableCell>{payout.payment_method || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(payout.status)}>
                            {payout.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(payout.requested_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {payout.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updatePayoutStatus(payout.id, 'completed')}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updatePayoutStatus(payout.id, 'rejected')}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {payout.status !== 'pending' && (
                            <span className="text-sm text-muted-foreground">
                              {payout.processed_at 
                                ? format(new Date(payout.processed_at), 'MMM d')
                                : '-'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : earnings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  No earnings records found
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Engineer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings.map((earning) => (
                      <TableRow key={earning.id}>
                        <TableCell className="font-mono text-xs">
                          {earning.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {earning.engineer_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          ${Number(earning.amount).toFixed(2)} {earning.currency}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(earning.status)}>
                            {earning.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(earning.created_at), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
