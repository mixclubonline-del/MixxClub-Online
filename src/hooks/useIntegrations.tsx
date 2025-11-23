// Stubbed - Integrations will be implemented in Phase 3
export const useIntegrations = () => ({
  providers: [],
  userIntegrations: [],
  streamingConnections: [],
  isLoading: false,
  error: null,
});

export const useIntegrationProviders = () => ({ data: [], isLoading: false });
export const useUserIntegrations = () => ({ data: [], isLoading: false });
export const useConnectIntegration = () => ({ mutate: () => {} });
export const useStreamingConnections = () => ({ data: [], isLoading: false });
export const useDisconnectIntegration = () => ({ mutate: () => {} });
