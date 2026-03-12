import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign, RefreshCw, Shield, Loader2, AlertTriangle,
  CreditCard, Zap, ArrowDownRight, TrendingUp, Ban, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminStripe, StripeCharge, StripeDispute } from '@/hooks/useAdminStripe';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const TIER_COLORS = [
  'hsl(var(--primary))',
  'hsl(142 71% 45%)',
  'hsl(48 96% 53%)',
  'hsl(262 83% 58%)',
  'hsl(199 89% 48%)',
];

export const AdminStripeCommandCenter = () => {
  const { data, loading, error, actionLoading, refresh, refund, acceptDispute } = useAdminStripe();
  const [refundTarget, setRefundTarget] = useState<StripeCharge | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Connecting to Stripe...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-sm text-destructive font-medium">Stripe Connection Failed</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-1" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { balance, charges, disputes, subscriptions, payouts, open_disputes_count } = data;

  return (
    <div className="space-y-6">
      {/* Balance + Sub Health */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceCard
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          label="Available Balance"
          value={`$${balance.available.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        />
        <BalanceCard
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-500"
          label="Pending Balance"
          value={`$${balance.pending.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        />
        <BalanceCard
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
          label="MRR"
          value={`$${subscriptions.mrr.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        />
        <BalanceCard
          icon={<Zap className="w-5 h-5" />}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          label="Active Subscriptions"
          value={subscriptions.active_count.toString()}
        />
      </div>

      {/* Open Disputes Alert */}
      {open_disputes_count > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <Shield className="w-4 h-4 shrink-0" />
          <span className="font-medium">{open_disputes_count} open dispute{open_disputes_count > 1 ? 's' : ''}</span>
          <span className="text-destructive/70">— scroll down to review and respond</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Charges Table */}
        <Card className="lg:col-span-2 bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Live Charges
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background/90 backdrop-blur-sm">
                  <tr className="border-b border-border/50 text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Amount</th>
                    <th className="pb-2 font-medium text-muted-foreground">Customer</th>
                    <th className="pb-2 font-medium text-muted-foreground">Status</th>
                    <th className="pb-2 font-medium text-muted-foreground">Date</th>
                    <th className="pb-2 font-medium text-muted-foreground w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {charges.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No charges found</td></tr>
                  ) : charges.map(ch => (
                    <tr key={ch.id} className="border-b border-border/20">
                      <td className="py-2.5 font-medium text-foreground">
                        ${ch.amount.toFixed(2)}
                        {ch.amount_refunded > 0 && (
                          <span className="text-xs text-red-400 ml-1">(-${ch.amount_refunded.toFixed(2)})</span>
                        )}
                      </td>
                      <td className="py-2.5 text-muted-foreground text-xs truncate max-w-[160px]">
                        {ch.customer_email || '—'}
                      </td>
                      <td className="py-2.5"><ChargeBadge status={ch.status} refunded={ch.refunded} /></td>
                      <td className="py-2.5 text-muted-foreground text-xs">
                        {format(new Date(ch.created), 'MMM d, HH:mm')}
                      </td>
                      <td className="py-2.5">
                        {ch.paid && !ch.refunded && ch.payment_intent && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-destructive hover:text-destructive" disabled={actionLoading}>
                                <ArrowDownRight className="w-3 h-3 mr-1" /> Refund
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Full Refund</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Refund <strong>${ch.amount.toFixed(2)}</strong> to {ch.customer_email || 'this customer'}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => refund(ch.payment_intent!)}
                                >
                                  Issue Refund
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Tier Breakdown */}
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Subscribers by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.tier_breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No active subscriptions</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={subscriptions.tier_breakdown}
                      dataKey="count"
                      nameKey="name"
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={70}
                      paddingAngle={2}
                    >
                      {subscriptions.tier_breakdown.map((_, i) => (
                        <Cell key={i} fill={TIER_COLORS[i % TIER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} subs`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {subscriptions.tier_breakdown.map((tier, i) => (
                    <div key={tier.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: TIER_COLORS[i % TIER_COLORS.length] }} />
                        <span className="text-muted-foreground">{tier.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-foreground">{tier.count}</span>
                        <span className="text-xs text-muted-foreground ml-1">(${tier.revenue.toFixed(0)}/mo)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Disputes */}
      {disputes.length > 0 && (
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-destructive" /> Stripe Disputes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {disputes.map(d => (
                <div key={d.id} className="flex items-start justify-between py-2.5 border-b border-border/20 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-md mt-0.5 ${
                      d.status === 'needs_response' ? 'bg-destructive/10 text-destructive' :
                      d.status === 'won' ? 'bg-green-500/10 text-green-400' :
                      d.status === 'lost' ? 'bg-muted text-muted-foreground' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        ${d.amount.toFixed(2)} — {d.reason.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.status.replace(/_/g, ' ')} · opened {format(new Date(d.created), 'MMM d, yyyy')}
                        {d.evidence_due && ` · evidence due ${format(new Date(d.evidence_due), 'MMM d')}`}
                      </p>
                    </div>
                  </div>
                  {d.status === 'needs_response' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs shrink-0" disabled={actionLoading}>
                          <Ban className="w-3 h-3 mr-1" /> Accept Loss
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Accept Dispute?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Accepting closes the dispute and the ${d.amount.toFixed(2)} charge will be refunded. This cannot be reversed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => acceptDispute(d.id)}>
                            Accept Loss
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Stripe Payouts */}
      {payouts.length > 0 && (
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Stripe Payouts to Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Amount</th>
                    <th className="pb-2 font-medium text-muted-foreground">Status</th>
                    <th className="pb-2 font-medium text-muted-foreground">Arrival</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p.id} className="border-b border-border/20">
                      <td className="py-2.5 font-medium text-foreground">${p.amount.toFixed(2)}</td>
                      <td className="py-2.5"><ChargeBadge status={p.status} /></td>
                      <td className="py-2.5 text-muted-foreground">{format(new Date(p.arrival_date), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-right">
        Last synced: {data.fetched_at ? format(new Date(data.fetched_at), 'PPpp') : '—'}
      </p>
    </div>
  );
};

function BalanceCard({ icon, iconBg, iconColor, label, value }: {
  icon: React.ReactNode; iconBg: string; iconColor: string; label: string; value: string;
}) {
  return (
    <Card className="bg-background/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-foreground truncate">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChargeBadge({ status, refunded }: { status: string; refunded?: boolean }) {
  if (refunded) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">refunded</span>;
  const styles: Record<string, string> = {
    succeeded: 'bg-green-500/20 text-green-400',
    paid: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400',
    in_transit: 'bg-blue-500/20 text-blue-400',
    canceled: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || 'bg-muted text-muted-foreground'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
