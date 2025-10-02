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
  
  // ===== TIER 1: MIX BATTLES ARENA (100 users) =====
  // Unlock: Advanced AI Matching Engine + Studio Partnership Beta
  TIER_1_BATTLES_STUDIOS: false, // Auto-unlock at 100 users
  
  // ===== TIER 2: KNOWLEDGE CENTER (250 users) =====
  // Educational Content Hub - Video tutorials, courses, certifications
  EDUCATION_HUB_ENABLED: false,
  // Advanced Collaboration 2.0 - Voice commands, live AI suggestions
  COLLABORATION_V2_ENABLED: false,
  
  // ===== TIER 3: COMMUNITY MARKETPLACE (500 users) =====
  // Marketplace Expansion - Sample libraries, presets, templates
  MARKETPLACE_ENABLED: false,
  // Label Services Integration
  LABEL_SERVICES_ENABLED: false,
  
  // ===== TIER 4: PRO INTEGRATIONS (1000 users) =====
  // API & Integration Framework - DAW plugins, streaming platforms
  INTEGRATIONS_ENABLED: false,
  // Advanced AI Audio Intelligence
  AI_AUDIO_INTELLIGENCE_ENABLED: false,
} as const;

/**
 * Helper function to check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};
