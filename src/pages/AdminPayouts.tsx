import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface PayoutRequest {
  id: string;
  engineer_id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

export default function AdminPayouts() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminStatus();
      fetchPayoutRequests();
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async () => {
    const { data, error } = await supabase.rpc('is_admin', { user_uuid: user?.id });
    if (error || !data) {
      navigate('/');
    }
  };

  const fetchPayoutRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;

      // Fetch engineer profiles
      if (data && data.length > 0) {
        const engineerIds = data.map(r => r.engineer_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', engineerIds);

        const requestsWithProfiles = data.map(request => ({
          ...request,
          profiles: profilesData?.find(p => p.id === request.engineer_id) || null
        }));

        setRequests(requestsWithProfiles as any);
      } else {
        setRequests([]);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payout requests',
        variant: 'destructive',
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
          notes: notes || null,
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Payout of $${selectedRequest.amount.toFixed(2)} approved`,
      });

      setSelectedRequest(null);
      setNotes('');
      fetchPayoutRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve payout',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!notes.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
          notes: notes,
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Payout Rejected',
        description: 'The engineer will be notified',
      });

      setSelectedRequest(null);
      setNotes('');
      fetchPayoutRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject payout',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-orange-500/10 text-orange-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payout Management</h1>
          <p className="text-muted-foreground">
            Review and process engineer payout requests
          </p>
        </div>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Pending Requests
            </CardTitle>
            <CardDescription>
              {pendingRequests.length} request(s) awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending payout requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {request.profiles?.full_name || request.profiles?.email || 'Unknown Engineer'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${request.amount.toFixed(2)} • Requested{' '}
                          {new Date(request.requested_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedRequest(request);
                        setNotes('');
                      }}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processed Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Processed payout requests</CardDescription>
          </CardHeader>
          <CardContent>
            {processedRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No processed requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {processedRequests.slice(0, 10).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <div className="font-medium">
                          {request.profiles?.full_name || request.profiles?.email || 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${request.amount.toFixed(2)} • Processed{' '}
                          {request.processed_at &&
                            new Date(request.processed_at).toLocaleDateString()}
                        </div>
                        {request.notes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Note: {request.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog
        open={selectedRequest !== null}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Payout Request</DialogTitle>
            <DialogDescription>
              Approve or reject this payout request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Engineer</div>
                    <div className="font-medium">
                      {selectedRequest.profiles?.full_name ||
                        selectedRequest.profiles?.email ||
                        'Unknown'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Amount</div>
                    <div className="font-medium text-lg">
                      ${selectedRequest.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">Requested</div>
                    <div className="text-sm">
                      {new Date(selectedRequest.requested_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Notes (optional for approval, required for rejection)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this payout..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={processing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
