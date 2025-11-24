import { useEnterpriseStore, ContractType, EnterprisePackageType } from '@/stores/enterpriseStore';

export function useContractManagement(accountId: string) {
  const store = useEnterpriseStore();

  const loadContracts = async () => {
    try {
      return store.getContracts(accountId);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to load contracts');
      return [];
    }
  };

  const createContract = async (data: {
    type: ContractType;
    packageType: EnterprisePackageType;
    duration: number;
    startDate: Date;
    autoRenew: boolean;
  }) => {
    try {
      const pkg = store.packages.find(p => p.type === data.packageType);
      if (!pkg) throw new Error('Package not found');

      const endDate = new Date(data.startDate);
      endDate.setMonth(endDate.getMonth() + data.duration);

      const contractId = await store.addContract({
        accountId,
        type: data.type,
        packageId: pkg.id,
        packageType: data.packageType,
        status: 'draft',
        terms: {
          duration: data.duration,
          startDate: data.startDate,
          endDate,
          autoRenew: data.autoRenew,
          noticeRequired: 30,
        },
        signedBy: '',
      });
      return contractId;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create contract');
      return null;
    }
  };

  const updateContract = async (contractId: string, updates: any) => {
    try {
      await store.updateContract(contractId, updates);
      return contractId;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to update contract');
      return null;
    }
  };

  const renewContract = async (contractId: string, duration: number) => {
    try {
      const contract = store.getContracts(accountId).find(c => c.id === contractId);
      if (!contract) throw new Error('Contract not found');

      const newEndDate = new Date(contract.terms.endDate);
      newEndDate.setMonth(newEndDate.getMonth() + duration);

      await store.renewContract(contractId, newEndDate);
      return contractId;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to renew contract');
      return null;
    }
  };

  const getExpiringContracts = async (daysThreshold: number = 30) => {
    try {
      const contracts = store.getContracts(accountId);
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + daysThreshold);

      return contracts.filter(c => 
        c.status === 'active' && 
        c.terms.endDate <= threshold &&
        c.terms.endDate >= new Date()
      );
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to get expiring contracts');
      return [];
    }
  };

  const signContract = async (contractId: string, signedBy: string) => {
    try {
      await store.updateContract(contractId, {
        status: 'active',
        signedBy,
        signedAt: new Date(),
      });
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to sign contract');
    }
  };

  return {
    contracts: store.getContracts(accountId),
    activeContracts: store.getActiveContracts(accountId),
    loading: store.loading,
    error: store.error,
    loadContracts,
    createContract,
    updateContract,
    renewContract,
    getExpiringContracts,
    signContract,
  };
}

export default useContractManagement;
