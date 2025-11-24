import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEnterpriseStore } from '@/stores/enterpriseStore';
import { AlertTriangle, Bell, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';

export function ContractExpirationAlerts() {
  const { accounts } = useEnterpriseStore();
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);

  useEffect(() => {
    const allContracts: any[] = [];
    const now = new Date();

    accounts.forEach(account => {
      account.contracts.forEach(contract => {
        if (contract.status === 'active') {
          const endDate = new Date(contract.terms.endDate);
          const daysUntilExpiry = differenceInDays(endDate, now);
          
          if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
            allContracts.push({
              ...contract,
              account,
              daysUntilExpiry,
            });
          }
        }
      });
    });

    allContracts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    setExpiringContracts(allContracts);
  }, [accounts]);

  const getSeverityColor = (days: number) => {
    if (days <= 7) return 'destructive';
    if (days <= 14) return 'default';
    return 'secondary';
  };

  const getSeverityIcon = (days: number) => {
    if (days <= 7) return <AlertTriangle className="h-4 w-4" />;
    if (days <= 14) return <Clock className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  const criticalCount = expiringContracts.filter(c => c.daysUntilExpiry <= 7).length;
  const warningCount = expiringContracts.filter(c => c.daysUntilExpiry > 7 && c.daysUntilExpiry <= 14).length;
  const noticeCount = expiringContracts.filter(c => c.daysUntilExpiry > 14).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical (≤7 days)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Warning (8-14 days)</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Plan renewal soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notice (15-30 days)</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noticeCount}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expiring Contracts</CardTitle>
          <CardDescription>
            {expiringContracts.length} contract(s) expiring in the next 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expiringContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <p className="font-medium">All contracts are in good standing</p>
              <p className="text-sm text-muted-foreground">No expiring contracts in the next 30 days</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expiringContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-start justify-between border rounded-lg p-4 space-y-2"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={getSeverityColor(contract.daysUntilExpiry)}>
                        <span className="flex items-center gap-1">
                          {getSeverityIcon(contract.daysUntilExpiry)}
                          {contract.daysUntilExpiry} days
                        </span>
                      </Badge>
                      <span className="font-medium">{contract.account.organizationName}</span>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Expires: {format(new Date(contract.terms.endDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p>Package: {contract.packageType}</p>
                      <p>Type: {contract.type}</p>
                      {contract.terms.autoRenew && (
                        <p className="text-green-600">✓ Auto-renew enabled</p>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Contact: {contract.account.contact.name} ({contract.account.contact.email})
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="default">
                      Contact Client
                    </Button>
                    <Button size="sm" variant="outline">
                      Renew Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
