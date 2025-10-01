import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, CheckCircle, XCircle, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

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

export default function MobileAdminPayouts() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
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

      if (data && data.length > 0) {
        const engineerIds = data.map(r => r.engineer_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
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

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 bg-background border-b z-10 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/mobile-admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Payout Requests</h1>
            <p className="text-xs text-muted-foreground">
              {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Pending Requests */}
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No pending payout requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Pending</h2>
            {pendingRequests.map((request) => (
              <Card
                key={request.id}
                className="cursor-pointer active:scale-98 transition-transform"
                onClick={() => {
                  setSelectedRequest(request);
                  setNotes('');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {request.profiles?.full_name || 'Unknown Engineer'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${request.amount.toFixed(2)} • {new Date(request.requested_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Recent Activity</h2>
            {processedRequests.slice(0, 10).map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        request.status === 'completed' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {request.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {request.profiles?.full_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${request.amount.toFixed(2)} • {request.processed_at && new Date(request.processed_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={selectedRequest !== null} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle>Review Payout</DialogTitle>
            <DialogDescription>
              Approve or reject this request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Engineer</div>
                    <div className="font-medium text-sm">
                      {selectedRequest.profiles?.full_name || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Amount</div>
                    <div className="font-bold text-lg">
                      ${selectedRequest.amount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Requested</div>
                    <div className="text-xs">
                      {new Date(selectedRequest.requested_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">
                  Notes {!notes.trim() && '(required for rejection)'}
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this payout..."
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              variant="outline"
              onClick={handleReject}
              disabled={processing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button className="w-full" onClick={handleApprove} disabled={processing}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isMobile && <MobileBottomNav />}
    </div>
  );
}
