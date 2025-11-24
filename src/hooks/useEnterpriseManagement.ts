import { useEnterpriseStore, EnterprisePackageType, AccountStatus, BillingCycle, SupportLevel } from '@/stores/enterpriseStore';

export function useEnterpriseManagement() {
  const store = useEnterpriseStore();

  const createAccount = async (data: {
    organizationName: string;
    contactName: string;
    contactEmail: string;
    packageType: EnterprisePackageType;
  }) => {
    try {
      const pkg = store.packages.find(p => p.type === data.packageType);
      if (!pkg) throw new Error('Package not found');

      const accountId = await store.addAccount({
        organizationName: data.organizationName,
        type: data.packageType,
        status: AccountStatus.Trial,
        packageId: pkg.id,
        billingInfo: {
          billingCycle: BillingCycle.Monthly,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          monthlyAmount: pkg.monthlyPrice,
          annualAmount: pkg.annualPrice,
          discountPercent: 0,
          taxRate: 0,
          billingEmail: data.contactEmail,
          invoiceFormat: 'email',
          outstandingBalance: 0,
        },
        teamMembers: [],
        contracts: [],
        metrics: [],
        customPricingRequests: [],
        whiteLabel: {
          enabled: pkg.whiteLabel,
        },
        contact: {
          name: data.contactName,
          email: data.contactEmail,
          title: 'Primary Contact',
        },
        notes: '',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      return accountId;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create account');
      throw error;
    }
  };

  const updateAccount = async (id: string, updates: any) => {
    try {
      await store.updateAccount(id, updates);
      return true;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to update account');
      return false;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await store.deleteAccount(id);
      return true;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to delete account');
      return false;
    }
  };

  const loadAccounts = async () => {
    return store.accounts;
  };

  const getAccount = async (id: string) => {
    return store.getAccount(id);
  };

  const upgradePackage = async (accountId: string, newPackageType: EnterprisePackageType) => {
    try {
      const pkg = store.packages.find(p => p.type === newPackageType);
      if (!pkg) throw new Error('Package not found');
      
      await store.updateAccount(accountId, {
        type: newPackageType,
        packageId: pkg.id,
        billingInfo: {
          ...store.getAccount(accountId)?.billingInfo!,
          monthlyAmount: pkg.monthlyPrice,
          annualAmount: pkg.annualPrice,
        },
      });
      return true;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to upgrade package');
      return false;
    }
  };

  const pauseAccount = async (accountId: string) => {
    try {
      await store.updateAccount(accountId, { status: AccountStatus.Paused });
      return true;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to pause account');
      return false;
    }
  };

  const reactivateAccount = async (accountId: string) => {
    try {
      await store.updateAccount(accountId, { status: AccountStatus.Active });
      return true;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to reactivate account');
      return false;
    }
  };

  return {
    selectedAccount: store.selectedAccountId ? store.getAccount(store.selectedAccountId) : null,
    accounts: store.accounts,
    packages: store.packages,
    loading: store.loading,
    error: store.error,
    createAccount,
    updateAccount,
    deleteAccount,
    loadAccounts,
    getAccount,
    upgradePackage,
    pauseAccount,
    reactivateAccount,
    selectAccount: store.selectAccount,
  };
}

export default useEnterpriseManagement;
