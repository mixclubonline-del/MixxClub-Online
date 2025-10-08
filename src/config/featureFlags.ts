/**
 * Feature Flags Configuration
 * 
 * Control which features are visible to users.
 * Set to `true` to enable a feature, `false` to hide it.
 */

export const FEATURE_FLAGS = {
  // ===== PHASE 0: IMMEDIATE ROLLOUT =====
  // Referral Program - Dual-sided incentives
  REFERRAL_PROGRAM_ENABLED: true,
  // AI Session Prep Showcase - Highlight AI analysis
  AI_SESSION_PREP_SHOWCASE: true,
  // Community Milestones on Homepage
  COMMUNITY_MILESTONES_HOMEPAGE: true,
  
  // ===== COMMUNITY-UNLOCKED FEATURES =====
  // Remote Collaboration - Unlocks at 250 users
  REMOTE_COLLABORATION_ENABLED: false,
  // Mix Battles Arena - Unlocks at 100 users
  MIX_BATTLES_ARENA_ENABLED: false,
  
  // The Lab - AI Hybrid DAW Studio
  THE_LAB_ENABLED: false,
  
  // ===== TIER 2: KNOWLEDGE CENTER (250 users) =====
  // Educational Content Hub - Video tutorials, courses, certifications
  EDUCATION_HUB_ENABLED: true,
  // Advanced Collaboration 2.0 - Voice commands, live AI suggestions
  COLLABORATION_V2_ENABLED: false,
  
  // ===== TIER 3: COMMUNITY MARKETPLACE (500 users) =====
  // Marketplace Expansion - Sample libraries, presets, templates
  MARKETPLACE_ENABLED: true,
  // Label Services Integration
  LABEL_SERVICES_ENABLED: true,
  
  // ===== TIER 4: PRO INTEGRATIONS (1000 users) =====
  // API & Integration Framework - DAW plugins, streaming platforms
  INTEGRATIONS_ENABLED: true,
  // Advanced AI Audio Intelligence
  AI_AUDIO_INTELLIGENCE_ENABLED: true,
  
  // ===== TIER 5: COLLABORATION & SOCIAL (1500 users) =====
  // Live Studio Sessions - Real-time collaboration
  LIVE_STUDIO_ENABLED: true,
  // Social Feed & Networking
  SOCIAL_FEED_ENABLED: true,
  
  // ===== DISTRIBUTION HUB PHASES =====
  // Phase 1: Affiliate partnerships (LIVE - already implemented)
  
  // Phase 2: White-Label Distribution Infrastructure
  DISTRIBUTION_WHITE_LABEL_ENABLED: false,
  
  // Phase 3: Enhanced Analytics & Playlist Pitching
  DISTRIBUTION_ANALYTICS_ENABLED: true,
  DISTRIBUTION_PLAYLIST_PITCHING_ENABLED: true,
  
  // Phase 4: Revenue Sharing & Commission System
  DISTRIBUTION_REVENUE_SHARING_ENABLED: false,
} as const;

/**
 * Helper function to check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};
