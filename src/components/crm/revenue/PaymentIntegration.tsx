import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Wallet, ArrowUpRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { PayoutRequestForm } from './PayoutRequestForm';
import { PayoutHistory } from './PayoutHistory';
import { RevenueAnalytics } from '@/hooks/useRevenueStreams';

interface PaymentIntegrationProps {
  analytics: RevenueAnalytics | null;
  loading: boolean;
  onPayoutRequest?: () => void;
}

export const PaymentIntegration = ({ analytics, loading, onPayoutRequest }: PaymentIntegrationProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const availableBalance = analytics 
    ? analytics.totalRevenue - analytics.completedPayouts - analytics.pendingPayouts 
    : 0;

  const paymentMethods = [
    { id: 'stripe', name: 'Stripe Connect', status: 'connected', icon: CreditCard },
    { id: 'paypal', name: 'PayPal', status: 'not_connected', icon: Wallet },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Payments & Payouts</CardTitle>
            <CardDescription>Manage your earnings and withdrawal methods</CardDescription>
          </div>
          <Badge variant="outline" className="text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Stripe Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="request">Request Payout</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-xl font-bold text-orange-400">
                        ${analytics?.pendingPayouts.toFixed(2) || '0.00'}
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
                        ${analytics?.completedPayouts.toFixed(2) || '0.00'}
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
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <method.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{method.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.status === 'connected' ? 'Ready for payouts' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {method.status === 'connected' ? (
                      <Badge className="bg-green-500/20 text-green-400">Connected</Badge>
                    ) : (
                      <Button variant="outline" size="sm">
                        Connect
                        <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action */}
            {availableBalance >= 50 && (
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setActiveTab('request')}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Request Payout (${availableBalance.toFixed(2)} available)
              </Button>
            )}

            {availableBalance < 50 && availableBalance > 0 && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <p className="text-sm text-yellow-400">
                  Minimum payout amount is $50. You need ${(50 - availableBalance).toFixed(2)} more.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="request">
            <PayoutRequestForm 
              availableBalance={availableBalance}
              onSuccess={() => {
                setActiveTab('history');
                onPayoutRequest?.();
              }}
            />
          </TabsContent>

          <TabsContent value="history">
            <PayoutHistory payouts={analytics?.recentPayouts || []} loading={loading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
