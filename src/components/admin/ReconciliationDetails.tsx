import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface ReconciliationDetailsProps {
  report: any;
}

export function ReconciliationDetails({ report }: ReconciliationDetailsProps) {
  const discrepancies: any[] = report.discrepancies || [];
  const stripe = report.stripe_reconciliation;
  const revenueByType = report.summary?.revenue_by_type || {};

  return (
    <div className="space-y-4">
      {/* Revenue by Service Type */}
      {Object.keys(revenueByType).length > 0 && (
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Revenue by Service Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(revenueByType).map(([type, data]: [string, any]) => (
                <div key={type} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground capitalize">{type}</p>
                  <p className="text-sm font-bold text-foreground">${data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">{data.count} transactions</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stripe Reconciliation Summary */}
      {stripe && !stripe.error && (
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Stripe Reconciliation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniBox label="Charges Checked" value={stripe.charges_checked} />
              <MiniBox label="Missing in Stripe" value={stripe.missing_in_stripe?.length || 0} warn={(stripe.missing_in_stripe?.length || 0) > 0} />
              <MiniBox label="Missing in DB" value={stripe.missing_in_db?.length || 0} warn={(stripe.missing_in_db?.length || 0) > 0} />
              <MiniBox label="Amount Mismatches" value={stripe.amount_mismatches?.length || 0} warn={(stripe.amount_mismatches?.length || 0) > 0} />
            </div>
          </CardContent>
        </Card>
      )}

      {stripe?.error && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-2 text-sm text-destructive">
            <XCircle className="w-4 h-4 shrink-0" />
            Stripe reconciliation unavailable: {stripe.error}
          </CardContent>
        </Card>
      )}

      {/* Discrepancy Table */}
      {discrepancies.length > 0 && (
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Discrepancies ({discrepancies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Type</th>
                    <th className="pb-2 font-medium text-muted-foreground">ID</th>
                    <th className="pb-2 font-medium text-muted-foreground">DB Amount</th>
                    <th className="pb-2 font-medium text-muted-foreground">Stripe Amount</th>
                    <th className="pb-2 font-medium text-muted-foreground">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {discrepancies.map((d, i) => (
                    <tr key={i} className="border-b border-border/20">
                      <td className="py-2">
                        <DiscrepancyBadge type={d.type} />
                      </td>
                      <td className="py-2 text-muted-foreground font-mono text-xs truncate max-w-[180px]">
                        {d.transaction_id || d.payment_intent || d.db_id || '—'}
                      </td>
                      <td className="py-2">
                        {d.db_amount != null ? `$${Number(d.db_amount).toFixed(2)}` : '—'}
                      </td>
                      <td className="py-2">
                        {d.stripe_amount != null ? `$${Number(d.stripe_amount).toFixed(2)}` : '—'}
                      </td>
                      <td className="py-2">
                        {d.difference != null ? (
                          <span className={d.difference > 0 ? 'text-green-400' : 'text-red-400'}>
                            {d.difference > 0 ? '+' : ''}${Number(d.difference).toFixed(2)}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {discrepancies.length === 0 && report && (
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-2 text-sm text-green-400">
            <CheckCircle className="w-4 h-4 shrink-0" />
            No discrepancies found — all records reconciled.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MiniBox({ label, value, warn }: { label: string; value: number | string; warn?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${warn ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-muted/50'}`}>
      <p className={`text-lg font-bold ${warn ? 'text-yellow-400' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function DiscrepancyBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    missing_in_stripe: { label: 'Missing in Stripe', cls: 'bg-orange-500/20 text-orange-400' },
    missing_in_db: { label: 'Missing in DB', cls: 'bg-red-500/20 text-red-400' },
    amount_mismatch: { label: 'Amount Mismatch', cls: 'bg-yellow-500/20 text-yellow-400' },
  };
  const c = config[type] || { label: type, cls: 'bg-muted text-muted-foreground' };
  return <span className={`text-xs px-2 py-0.5 rounded-full ${c.cls}`}>{c.label}</span>;
}
