export const useABTest = (testName: string) => {
  return {
    variant: 'control',
    config: {},
    trackImpression: async () => {},
    trackConversion: async () => {}
  };
};
