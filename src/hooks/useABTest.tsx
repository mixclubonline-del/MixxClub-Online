/**
 * useABTest — Re-exports useABVariant for backward compatibility.
 * @deprecated Use useABVariant directly.
 */
import { useABVariant } from './useABVariant';

export const useABTest = (testName: string) => {
  const { variant, trackConversion } = useABVariant(testName);
  return {
    variant,
    config: {},
    trackImpression: async () => {},
    trackConversion: async (event?: string) => trackConversion(event || 'default'),
  };
};
