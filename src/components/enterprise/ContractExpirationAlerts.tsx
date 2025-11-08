import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Calendar, Mail, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface Contract {
  id: string;
  contract_number: string;
  package_type: string;
  end_date: string;
  value: number;
  organization_name: string;
  days_until_expiration: number;
}

interface Notification {
  id: string;
  contract_id: string;
  days_threshold: number;
  sent_at: string;
  recipient_email: string;
}

export function ContractExpirationAlerts() {
  const [expiringContracts, setExpiringContracts] = useState<Contract[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load contracts expiring within 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: contracts, error: contractsError } = await supabase
        .from('enterprise_contracts')
        .select(`
          id,
          contract_number,
          package_type,
          end_date,
          value,
          enterprise_accounts!inner (
            organization_name
          )
        `)
        .eq('status', 'active')
        .lte('end_date', thirtyDaysFromNow.toISOString())
        .order('end_date', { ascending: true });

      if (contractsError) throw contractsError;

      // Calculate days until expiration
      const contractsWithDays = (contracts || []).map((contract: any) => {
        const endDate = new Date(contract.end_date);
        const today = new Date();
        const daysUntil = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: contract.id,
          contract_number: contract.contract_number,
          package_type: contract.package_type,
          end_date: contract.end_date,
          value: contract.value,
          organization_name: contract.enterprise_accounts?.organization_name || 'Unknown',
          days_until_expiration: daysUntil,
        };
      });

      setExpiringContracts(contractsWithDays);

      // Load notification history
      const { data: notificationData, error: notificationError } = await supabase
        .from('contract_expiration_notifications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (notificationError) throw notificationError;

      setNotifications(notificationData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contract expiration data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerCheck = async () => {
    setChecking(true);
    try {
      const { error } = await supabase.functions.invoke('trigger-contract-check');

      if (error) throw error;

      toast({
        title: 'Check Triggered',
        description: 'Contract expiration check has been initiated. Notifications will be sent to affected accounts.',
      });

      // Reload data after a short delay
      setTimeout(() => {
        loadData();
      }, 2000);
    } catch (error) {
      console.error('Error triggering check:', error);
      toast({
        title: 'Error',
        description: 'Failed to trigger contract expiration check',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  };

  const getUrgencyBadge = (days: number) => {
    if (days <= 1) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Critical</Badge>;
    } else if (days <= 7) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> High</Badge>;
    } else if (days <= 30) {
      return <Badge variant="secondary" className="gap-1"><Calendar className="h-3 w-3" /> Medium</Badge>;
    }
    return <Badge variant="outline">Low</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with action button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contract Expiration Alerts</CardTitle>
              <CardDescription>
                Contracts expiring within 30 days with automated email notifications
              </CardDescription>
            </div>
            <Button onClick={triggerCheck} disabled={checking} variant="outline" size="sm">
              {checking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Run Check Now
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Expiring Contracts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Contracts Expiring Soon ({expiringContracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expiringContracts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No contracts expiring within 30 days
            </p>
          ) : (
            <div className="space-y-4">
              {expiringContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{contract.organization_name}</span>
                      {getUrgencyBadge(contract.days_until_expiration)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Contract: {contract.contract_number} • {contract.package_type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {contract.days_until_expiration} days
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires {format(new Date(contract.end_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Recent Notifications ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No notifications sent yet
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const contract = expiringContracts.find((c) => c.id === notification.contract_id);
                return (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between p-3 border rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{notification.days_threshold}-day reminder</div>
                        <div className="text-xs text-muted-foreground">
                          Sent to {notification.recipient_email}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(notification.sent_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
