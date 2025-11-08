import { useState, useCallback } from 'react';
import { useEnterpriseStore, Contract, ContractType, EnterprisePackageType } from '@/stores/enterpriseStore';
import { EnterpriseService } from '@/services/enterpriseService';

/**
 * useContractManagement
 * Hook for managing enterprise service contracts
 */

export function useContractManagement(accountId: string) {
  const store = useEnterpriseStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create new contract
  const createContract = useCallback(
    async (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);
      try {
        // Add to store
        const contractId = await store.addContract(contract);

        // Add to database
        await EnterpriseService.createContract(contract);

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'CONTRACT_CREATED', {
          type: contract.type,
          packageType: contract.packageType,
        });

        return contractId;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create contract';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountId, store]
  );

  // Update contract
  const updateContract = useCallback(
    async (contractId: string, updates: Partial<Contract>) => {
      setLoading(true);
      setError(null);
      try {
        // Update store
        await store.updateContract(contractId, updates);

        // Update database
        await EnterpriseService.updateContract(contractId, updates);

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'CONTRACT_UPDATED', {
          contractId,
          changes: Object.keys(updates),
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update contract';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountId, store]
  );

  // Get all contracts for account
  const getContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const contracts = await EnterpriseService.getContracts(accountId);
      return contracts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch contracts';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  // Get active contracts
  const getActiveContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const contracts = await EnterpriseService.getActiveContracts(accountId);
      return contracts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch active contracts';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  // Renew contract
  const renewContract = useCallback(
    async (contractId: string, monthsToAdd: number) => {
      setLoading(true);
      setError(null);
      try {
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + monthsToAdd);

        // Update in store
        await store.renewContract(contractId, newEndDate);

        // Update in database
        await EnterpriseService.updateContract(contractId, {
          terms: {
            endDate: newEndDate,
          },
        });

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'CONTRACT_RENEWED', {
          contractId,
          newEndDate,
          monthsToAdd,
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to renew contract';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountId, store]
  );

  // Terminate contract
  const terminateContract = useCallback(
    async (contractId: string, reason?: string) => {
      setLoading(true);
      setError(null);
      try {
        // Update in store
        await store.updateContract(contractId, {
          status: 'cancelled',
        });

        // Update in database
        await EnterpriseService.updateContract(contractId, {
          status: 'cancelled',
        });

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'CONTRACT_TERMINATED', {
          contractId,
          reason,
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to terminate contract';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [accountId, store]
  );

  // Get store contracts
  const contracts = store.getContracts(accountId);
  const activeContracts = store.getActiveContracts(accountId);

  return {
    // State
    contracts,
    activeContracts,
    loading,
    error,

    // Actions
    createContract,
    updateContract,
    getContracts,
    getActiveContracts,
    renewContract,
    terminateContract,
  };
}

export default useContractManagement;
