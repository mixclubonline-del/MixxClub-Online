/**
 * useABTests — Re-exports ABProvider context for admin use.
 * @deprecated Use useABContext from ABProvider directly.
 */
import { useABContext } from '@/components/marketing/ABProvider';

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
  const { tests, isLoading } = useABContext();
  return {
    variants: tests,
    isLoading,
    createVariant: async () => {},
    updateVariant: async () => {},
    deleteVariant: async () => {},
    trackImpression: async () => {},
    trackConversion: async () => {},
    declareWinner: async () => {},
  };
};
