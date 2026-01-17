import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { PayoutRequestForm } from './PayoutRequestForm';
import { PayoutHistory } from './PayoutHistory';
import { RevenueAnalytics } from '@/hooks/useRevenueStreams';
import { StripeConnectCard } from '@/components/engineer/StripeConnectCard';
import { EngineerPayoutsTable } from '@/components/engineer/EngineerPayoutsTable';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { useEngineerPayouts } from '@/hooks/useEngineerPayouts';

interface PaymentIntegrationProps {
  analytics: RevenueAnalytics | null;
  loading: boolean;
  onPayoutRequest?: () => void;
}

export const PaymentIntegration = ({ analytics, loading, onPayoutRequest }: PaymentIntegrationProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { status, isLoading: stripeLoading, canReceivePayouts } = useStripeConnect();
  const { summary } = useEngineerPayouts();
  
  const availableBalance = analytics 
    ? analytics.totalRevenue - analytics.completedPayouts - analytics.pendingPayouts 
    : 0;

  // Determine Stripe status badge
  const getStripeBadge = () => {
    if (stripeLoading) {
      return (
        <Badge variant="outline" className="text-muted-foreground border-muted">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Checking...
        </Badge>
      );
    }
    
    if (canReceivePayouts) {
      return (
        <Badge variant="outline" className="text-green-400 border-green-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Payouts Enabled
        </Badge>
      );
    }
    
    if (status.connected && !status.detailsSubmitted) {
      return (
        <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Setup Incomplete
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-red-400 border-red-500/30">
        <AlertCircle className="w-3 h-3 mr-1" />
        Not Connected
      </Badge>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Payments & Payouts</CardTitle>
            <CardDescription>Manage your earnings and withdrawal methods</CardDescription>
          </div>
          {getStripeBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payouts">Auto Payouts</TabsTrigger>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stripe Connect Status Card */}
            <StripeConnectCard />

            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available</p>
                      <p className="text-xl font-bold text-green-400">
                        ${availableBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-500/10 border-orange-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Payouts</p>
                      <p className="text-xl font-bold text-orange-400">
                        ${summary.totalPending.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Paid Out</p>
                      <p className="text-xl font-bold text-blue-400">
                        ${summary.totalCompleted.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Payment Methods</h4>
              <div className="space-y-3">
                <div 
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Stripe Connect</p>
                      <p className="text-sm text-muted-foreground">
                        {canReceivePayouts 
                          ? `Bank account ****${status.details.bankLast4 || '****'}` 
                          : status.connected 
                            ? 'Setup incomplete' 
                            : 'Not connected'
                        }
                      </p>
                    </div>
                  </div>
                  {canReceivePayouts ? (
                    <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                      Setup Required
                    </Badge>
                  )}
                </div>

                <div 
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">PayPal</p>
                      <p className="text-sm text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Connect
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            {availableBalance >= 50 && canReceivePayouts && (
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setActiveTab('request')}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Request Payout (${availableBalance.toFixed(2)} available)
              </Button>
            )}

            {!canReceivePayouts && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <p className="text-sm text-yellow-400">
                  Connect your bank account to start receiving payouts.
                </p>
              </div>
            )}

            {availableBalance < 50 && availableBalance > 0 && canReceivePayouts && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <p className="text-sm text-yellow-400">
                  Minimum payout amount is $50. You need ${(50 - availableBalance).toFixed(2)} more.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payouts">
            <EngineerPayoutsTable showSummary={true} />
          </TabsContent>

          <TabsContent value="request">
            {canReceivePayouts ? (
              <PayoutRequestForm 
                availableBalance={availableBalance}
                onSuccess={() => {
                  setActiveTab('history');
                  onPayoutRequest?.();
                }}
              />
            ) : (
              <div className="text-center py-12 space-y-4">
                <AlertCircle className="w-12 h-12 mx-auto text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-lg">Connect Bank Account First</h3>
                  <p className="text-muted-foreground">
                    You need to set up your Stripe Connect account before requesting payouts.
                  </p>
                </div>
                <Button onClick={() => setActiveTab('overview')}>
                  Go to Setup
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <PayoutHistory payouts={analytics?.recentPayouts || []} loading={loading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
