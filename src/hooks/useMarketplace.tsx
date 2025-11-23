// Stubbed - Marketplace will be implemented in Phase 3
export const useMarketplace = () => ({
  items: [],
  categories: [],
  purchases: [],
  userListings: [],
  isLoading: false,
  error: null,
});

export const useMarketplaceItems = () => ({ data: [], isLoading: false });
export const useMarketplaceCategories = () => ({ data: [], isLoading: false });
export const useMarketplaceItem = () => ({ data: null, isLoading: false });
export const usePurchaseItem = () => ({ mutate: () => {} });
export const useUserPurchases = () => ({ data: [], isLoading: false });
