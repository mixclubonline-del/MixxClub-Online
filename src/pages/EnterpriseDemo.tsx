import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, FileText, CreditCard, Bell } from 'lucide-react';
import { AccountManagementDemo } from '@/components/enterprise/AccountManagementDemo';
import { TeamManagementDemo } from '@/components/enterprise/TeamManagementDemo';
import { ContractManagementDemo } from '@/components/enterprise/ContractManagementDemo';
import { PaymentLinkGenerator } from '@/components/enterprise/PaymentLinkGenerator';
import { ContractExpirationAlerts } from '@/components/enterprise/ContractExpirationAlerts';

export default function EnterpriseDemo() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Enterprise Management Demo</h1>
          <p className="text-muted-foreground">
            Test account creation, team management, and contract operations
          </p>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2" disabled={!selectedAccountId}>
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2" disabled={!selectedAccountId}>
              <FileText className="h-4 w-4" />
              Contracts
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts">
            <AccountManagementDemo onAccountSelect={setSelectedAccountId} />
          </TabsContent>

          <TabsContent value="team">
            {selectedAccountId ? (
              <TeamManagementDemo accountId={selectedAccountId} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    Select an account first to manage team members
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contracts">
            {selectedAccountId ? (
              <ContractManagementDemo accountId={selectedAccountId} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    Select an account first to manage contracts
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments">
            <PaymentLinkGenerator accountId={selectedAccountId} />
          </TabsContent>

          <TabsContent value="alerts">
            <ContractExpirationAlerts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
