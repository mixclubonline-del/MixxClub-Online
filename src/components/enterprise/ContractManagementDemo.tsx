import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContractManagement } from '@/hooks/useContractManagement';
import { Contract } from '@/services/ContractManagementService';
import { Loader2, FileText, Calendar, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ContractManagementDemoProps {
  accountId: string;
}

export function ContractManagementDemo({ accountId }: ContractManagementDemoProps) {
  const { contracts, loading, loadContracts, createContract, renewContract } = useContractManagement(accountId);
  const { toast } = useToast();
  const [contractType, setContractType] = useState<Contract['contractType']>('standard');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadContracts();
  }, [accountId]);

  const handleCreateContract = async () => {
    if (!startDate) {
      toast({
        title: 'Missing fields',
        description: 'Please set a start date',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createContract({
        accountId,
        contractType,
        status: 'active',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        autoRenew: false,
        terms: { duration: '12 months', paymentTerms: 'Net 30' },
        slaTerms: { uptime: '99.9%', support: '24/7' },
      });

      toast({
        title: 'Contract created',
        description: 'New contract has been created',
      });

      setStartDate('');
      setEndDate('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create contract',
        variant: 'destructive',
      });
    }
  };

  const handleRenew = async (contractId: string) => {
    const newEndDate = new Date();
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    try {
      await renewContract(contractId, newEndDate);
      toast({
        title: 'Contract renewed',
        description: 'Contract has been renewed for another year',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to renew contract',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'expired':
        return 'destructive';
      case 'renewed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create Contract</CardTitle>
          <CardDescription>Add a new contract for this account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract-type">Contract Type</Label>
            <Select value={contractType} onValueChange={(v) => setContractType(v as Contract['contractType'])}>
              <SelectTrigger id="contract-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="pilot">Pilot</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date (Optional)</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Button onClick={handleCreateContract} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Create Contract
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>Manage account contracts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : contracts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No contracts yet</p>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <div key={contract.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={getStatusBadgeVariant(contract.status)}>
                      {contract.status}
                    </Badge>
                    <Badge variant="outline">{contract.contractType}</Badge>
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Start: {format(contract.startDate, 'MMM d, yyyy')}
                    </div>
                    {contract.endDate && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        End: {format(contract.endDate, 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                  {contract.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleRenew(contract.id)}
                      disabled={loading}
                    >
                      <RefreshCcw className="mr-2 h-3 w-3" />
                      Renew Contract
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
