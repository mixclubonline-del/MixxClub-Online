import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContractManagement } from '@/hooks/useContractManagement';
import { ContractType, EnterprisePackageType } from '@/stores/enterpriseStore';
import { Loader2, Plus, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ContractManagementDemoProps {
  accountId: string;
}

export function ContractManagementDemo({ accountId }: ContractManagementDemoProps) {
  const { contracts, activeContracts, createContract, renewContract, signContract } = useContractManagement(accountId);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [contractType, setContractType] = useState<ContractType>(ContractType.Service);
  const [packageType, setPackageType] = useState<EnterprisePackageType>(EnterprisePackageType.LabelEssentials);
  const [duration, setDuration] = useState('12');
  const [autoRenew, setAutoRenew] = useState(true);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createContract({
        type: contractType,
        packageType,
        duration: parseInt(duration),
        startDate: new Date(),
        autoRenew,
      });
      toast({
        title: 'Contract created',
        description: 'New contract has been created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create contract',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (contractId: string) => {
    try {
      await renewContract(contractId, 12);
      toast({
        title: 'Contract renewed',
        description: 'Contract has been renewed for 12 months',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to renew contract',
        variant: 'destructive',
      });
    }
  };

  const handleSign = async (contractId: string) => {
    try {
      await signContract(contractId, 'Demo User');
      toast({
        title: 'Contract signed',
        description: 'Contract has been signed and activated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign contract',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      draft: 'secondary',
      expired: 'destructive',
      cancelled: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getDaysUntilExpiry = (endDate: Date) => {
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Contract</CardTitle>
          <CardDescription>Generate a new service contract</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract-type">Contract Type</Label>
            <Select value={contractType} onValueChange={(v) => setContractType(v as ContractType)}>
              <SelectTrigger id="contract-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ContractType.Service}>Service Agreement</SelectItem>
                <SelectItem value={ContractType.Support}>Support Contract</SelectItem>
                <SelectItem value={ContractType.SLA}>SLA Agreement</SelectItem>
                <SelectItem value={ContractType.Custom}>Custom Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="package-type">Package Type</Label>
            <Select value={packageType} onValueChange={(v) => setPackageType(v as EnterprisePackageType)}>
              <SelectTrigger id="package-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EnterprisePackageType.LabelEssentials}>Label Essentials</SelectItem>
                <SelectItem value={EnterprisePackageType.StudioProfessional}>Studio Professional</SelectItem>
                <SelectItem value={EnterprisePackageType.UniversityEnterprise}>University Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (months)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="36"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-renew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="auto-renew">Auto-renew contract</Label>
          </div>

          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Contract
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Contracts ({contracts.length})</CardTitle>
          <CardDescription>Manage existing contracts</CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No contracts yet</p>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{contract.type}</span>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(contract.terms.startDate), 'MMM dd, yyyy')} - {format(new Date(contract.terms.endDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {contract.status === 'active' && (
                      <p>
                        {getDaysUntilExpiry(contract.terms.endDate) > 0
                          ? `Expires in ${getDaysUntilExpiry(contract.terms.endDate)} days`
                          : 'Expired'}
                      </p>
                    )}
                    <p>Package: {contract.packageType}</p>
                    {contract.terms.autoRenew && <p className="text-green-600">Auto-renew enabled</p>}
                  </div>

                  <div className="flex gap-2">
                    {contract.status === 'draft' && (
                      <Button size="sm" onClick={() => handleSign(contract.id)}>
                        Sign Contract
                      </Button>
                    )}
                    {contract.status === 'active' && getDaysUntilExpiry(contract.terms.endDate) < 30 && (
                      <Button size="sm" variant="outline" onClick={() => handleRenew(contract.id)}>
                        Renew
                      </Button>
                    )}
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
