import { useState, useCallback } from 'react';
import { ContractManagementService, Contract } from '@/services/ContractManagementService';

/**
 * useContractManagement
 * Hook for managing enterprise contracts
 */
export function useContractManagement(accountId: string) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load contracts
  const loadContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ContractManagementService.listContracts(accountId);
      setContracts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load contracts';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  // Create contract
  const createContract = useCallback(
    async (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);
      try {
        const contract = await ContractManagementService.createContract(contractData);
        setContracts((prev) => [contract, ...prev]);
        return contract;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create contract';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update contract
  const updateContract = useCallback(
    async (contractId: string, updates: Partial<Contract>) => {
      setLoading(true);
      setError(null);
      try {
        const updated = await ContractManagementService.updateContract(contractId, updates);
        setContracts((prev) =>
          prev.map((contract) => (contract.id === contractId ? updated : contract))
        );
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update contract';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Renew contract
  const renewContract = useCallback(
    async (contractId: string, newEndDate: Date) => {
      setLoading(true);
      setError(null);
      try {
        const newContract = await ContractManagementService.renewContract(contractId, newEndDate);
        await loadContracts(); // Reload all contracts
        return newContract;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to renew contract';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadContracts]
  );

  // Get expiring contracts
  const getExpiringContracts = useCallback(async (daysAhead: number = 30) => {
    setLoading(true);
    setError(null);
    try {
      const expiring = await ContractManagementService.getExpiringContracts(daysAhead);
      return expiring;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get expiring contracts';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    contracts,
    loading,
    error,
    loadContracts,
    createContract,
    updateContract,
    renewContract,
    getExpiringContracts,
  };
}

export default useContractManagement;
