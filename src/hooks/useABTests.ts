export interface ABTestVariant {
  id: string;
  test_name: string;
  variant_name: string;
  traffic_percentage: number;
  impressions: number;
  conversions: number;
  is_winner: boolean;
  variant_config: any;
  created_at: string;
  updated_at: string;
}

export const useABTests = () => {
  return {
    variants: [],
    isLoading: false,
    createVariant: async () => {},
    updateVariant: async () => {},
    deleteVariant: async () => {},
    trackImpression: async () => {},
    trackConversion: async () => {},
    declareWinner: async () => {}
  };
};
