import { useState, useCallback } from 'react';
import { useEnterpriseStore, EnterpriseAccount, AccountStatus, EnterprisePackageType } from '@/stores/enterpriseStore';
import { EnterpriseService } from '@/services/enterpriseService';

/**
 * useEnterpriseManagement
 * Hook for managing enterprise accounts with Supabase sync
 */

export function useEnterpriseManagement() {
  const store = useEnterpriseStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create new enterprise account
  const createAccount = useCallback(
    async (accountData: Omit<EnterpriseAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);
      try {
        // Save to database
        const dbAccount = await EnterpriseService.createAccount(accountData);

        // Update local store
        const localId = await store.addAccount(accountData);

        // Log audit event
        await EnterpriseService.logAuditEvent(localId, 'ACCOUNT_CREATED', {
          organizationName: accountData.organizationName,
          type: accountData.type,
        });

        return dbAccount;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create account';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Update enterprise account
  const updateAccount = useCallback(
    async (accountId: string, updates: Partial<EnterpriseAccount>) => {
      setLoading(true);
      setError(null);
      try {
        // Update database
        await EnterpriseService.updateAccount(accountId, updates);

        // Update local store
        await store.updateAccount(accountId, updates);

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'ACCOUNT_UPDATED', updates);

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update account';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Delete enterprise account
  const deleteAccount = useCallback(
    async (accountId: string) => {
      setLoading(true);
      setError(null);
      try {
        // Delete from database
        await EnterpriseService.deleteAccount(accountId);

        // Update local store
        await store.deleteAccount(accountId);

        // Log audit event
        await EnterpriseService.logAuditEvent(accountId, 'ACCOUNT_DELETED', {});

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete account';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Load accounts from database
  const loadAccounts = useCallback(
    async (filters?: { status?: AccountStatus; type?: EnterprisePackageType }) => {
      setLoading(true);
      setError(null);
      try {
        const accounts = await EnterpriseService.listAccounts(filters);
        // Could sync with store if needed
        return accounts;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load accounts';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get single account
  const getAccount = useCallback(
    async (accountId: string) => {
      setLoading(true);
      setError(null);
      try {
        const account = await EnterpriseService.getAccount(accountId);
        store.selectAccount(accountId);
        return account;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch account';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Upgrade account package
  const upgradePackage = useCallback(
    async (accountId: string, newPackageId: string, newPackageType: EnterprisePackageType) => {
      setLoading(true);
      setError(null);
      try {
        await store.updateAccount(accountId, {
          packageId: newPackageId,
          type: newPackageType,
        });

        await EnterpriseService.updateAccount(accountId, {
          packageId: newPackageId,
          type: newPackageType,
        });

        await EnterpriseService.logAuditEvent(accountId, 'PACKAGE_UPGRADED', {
          newPackageType,
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upgrade package';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Pause account
  const pauseAccount = useCallback(
    async (accountId: string, reason?: string) => {
      setLoading(true);
      setError(null);
      try {
        await store.updateAccount(accountId, {
          status: AccountStatus.Paused,
        });

        await EnterpriseService.updateAccount(accountId, {
          status: AccountStatus.Paused,
        });

        await EnterpriseService.logAuditEvent(accountId, 'ACCOUNT_PAUSED', {
          reason,
        });

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to pause account';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Reactivate account
  const reactivateAccount = useCallback(
    async (accountId: string) => {
      setLoading(true);
      setError(null);
      try {
        await store.updateAccount(accountId, {
          status: AccountStatus.Active,
        });

        await EnterpriseService.updateAccount(accountId, {
          status: AccountStatus.Active,
        });

        await EnterpriseService.logAuditEvent(accountId, 'ACCOUNT_REACTIVATED', {});

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to reactivate account';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  return {
    // State
    selectedAccount: store.accounts.find((a) => a.id === store.selectedAccountId),
    accounts: store.accounts,
    loading,
    error,

    // Actions
    createAccount,
    updateAccount,
    deleteAccount,
    loadAccounts,
    getAccount,
    upgradePackage,
    pauseAccount,
    reactivateAccount,
  };
}

export default useEnterpriseManagement;
