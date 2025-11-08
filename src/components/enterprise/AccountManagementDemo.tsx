import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnterpriseManagement } from '@/hooks/useEnterpriseManagement';
import { EnterprisePackageType, AccountStatus } from '@/stores/enterpriseStore';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccountManagementDemoProps {
  onAccountSelect: (accountId: string) => void;
}

export function AccountManagementDemo({ onAccountSelect }: AccountManagementDemoProps) {
  const { accounts, loading, createAccount, loadAccounts } = useEnterpriseManagement();
  const { toast } = useToast();
  const [organizationName, setOrganizationName] = useState('');
  const [packageType, setPackageType] = useState<EnterprisePackageType>(EnterprisePackageType.LabelEssentials);
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreateAccount = async () => {
    if (!organizationName || !contactEmail || !contactName) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newAccount = await createAccount({
        organizationName,
        type: packageType,
        status: AccountStatus.Active,
        packageId: `pkg-${packageType}`,
        contact: {
          name: contactName,
          email: contactEmail,
          title: 'Account Manager',
        },
        billingInfo: {
          billingCycle: 'monthly' as any,
          nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          monthlyAmount: 0,
          annualAmount: 0,
          discountPercent: 0,
          taxRate: 0,
          billingEmail: contactEmail,
          invoiceFormat: 'email' as any,
          outstandingBalance: 0,
        },
        teamMembers: [],
        contracts: [],
        metrics: [],
        customPricingRequests: [],
        whiteLabel: {
          enabled: false,
        },
        notes: '',
      });

      toast({
        title: 'Account created',
        description: `Successfully created ${organizationName}`,
      });

      setOrganizationName('');
      setContactEmail('');
      setContactName('');
      onAccountSelect(newAccount.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Enterprise Account</CardTitle>
          <CardDescription>Add a new enterprise customer account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              placeholder="Acme Corporation"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-name">Contact Name</Label>
            <Input
              id="contact-name"
              placeholder="John Doe"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@acme.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="package">Package Type</Label>
            <Select value={packageType} onValueChange={(v) => setPackageType(v as EnterprisePackageType)}>
              <SelectTrigger id="package">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EnterprisePackageType.LabelEssentials}>Label Essentials</SelectItem>
                <SelectItem value={EnterprisePackageType.StudioProfessional}>Studio Professional</SelectItem>
                <SelectItem value={EnterprisePackageType.UniversityEnterprise}>University Enterprise</SelectItem>
                <SelectItem value={EnterprisePackageType.Custom}>Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCreateAccount} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Enterprise Accounts</CardTitle>
              <CardDescription>Manage existing accounts</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => loadAccounts()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No accounts yet</p>
          ) : (
            <div className="space-y-2">
              {accounts.map((account) => (
                <Button
                  key={account.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onAccountSelect(account.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">{account.organizationName}</div>
                    <div className="text-sm text-muted-foreground">
                      {account.type} • {account.status}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
