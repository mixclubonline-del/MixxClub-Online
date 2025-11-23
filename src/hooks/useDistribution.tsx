// Stubbed - Distribution will be implemented in Phase 3
export const useDistribution = () => ({
  releases: [],
  referrals: [],
  analytics: null,
  isLoading: false,
  error: null,
  createRelease: async () => {},
  updateRelease: async () => {},
  deleteRelease: async () => {},
});

export const DISTRIBUTORS = [];
export const useDistributionReferrals = () => ({ data: [], isLoading: false });
export const useTrackReferral = () => ({ mutate: () => {} });
export const useMusicReleases = () => ({ data: [], isLoading: false });
export const useCreateRelease = () => ({ mutate: () => {} });
export const useUpdateRelease = () => ({ mutate: () => {} });
export const useDistributionAnalytics = () => ({ data: null, isLoading: false });
export const buildDistributorLink = () => '';
