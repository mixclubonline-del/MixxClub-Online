/**
 * Feature Flags Configuration
 * 
 * Control which features are visible to users.
 * Set to `true` to enable a feature, `false` to hide it.
 */

export const FEATURE_FLAGS = {
  // The Lab - AI Hybrid DAW Studio
  // Enable this when ready to launch the AI Studio feature
  THE_LAB_ENABLED: false,
  
  // Add more feature flags here as needed
  // EXAMPLE_FEATURE: true,
} as const;

/**
 * Helper function to check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};
