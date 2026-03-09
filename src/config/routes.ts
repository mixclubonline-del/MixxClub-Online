/**
 * Centralized Route Constants — Single Source of Truth
 *
 * Every navigate() call and <Route path="..."> should reference these
 * constants instead of hardcoded strings. Organised by domain.
 *
 * Dynamic routes expose helper functions that accept the required param.
 */

// ─── Public / Marketing ──────────────────────────────────────
export const ROUTES = {
  // Landing & marketing
  HOME: '/',
  DEMO: '/demo',
  INSIDER_DEMO: '/insider-demo',
  WAITLIST: '/waitlist',
  INSTALL: '/install',
  HOW_IT_WORKS: '/how-it-works',
  INTRO_HOME: '/home',
  SHOWCASE: '/showcase',
  FAQ: '/faq',
  PRICING: '/pricing',
  CONTACT: '/contact',
  ABOUT: '/about',
  PRESS: '/press',
  ENTERPRISE: '/enterprise',
  ENTERPRISE_DEMO: '/enterprise-demo',
  START: '/start',
  PROMO_FUNNEL: '/go',
  SITEMAP: '/sitemap',

  // Persona landing pages
  FOR_ARTISTS: '/for-artists',
  FOR_ENGINEERS: '/for-engineers',
  FOR_PRODUCERS: '/for-producers',
  FOR_FANS: '/for-fans',
  CHOOSE_PATH: '/how-it-works',
  REQUEST_ACCESS: '/request-access',

  // Auth & legal
  AUTH: '/auth',
  AUTH_CALLBACK: '/auth/callback',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  DEMO_LOGIN: '/demo-login',

  // ─── App / Protected ───────────────────────────────────────
  DASHBOARD: '/dashboard',

  // Role CRMs
  ARTIST_CRM: '/artist-crm',
  ENGINEER_CRM: '/engineer-crm',
  PRODUCER_CRM: '/producer-crm',
  FAN_HUB: '/fan-hub',
  ADMIN: '/admin',
  PROMO_STUDIO: '/promo-studio',

  // Onboarding
  SELECT_ROLE: '/select-role',
  ONBOARDING_ARTIST: '/onboarding/artist',
  ONBOARDING_ENGINEER: '/onboarding/engineer',
  ONBOARDING_HYBRID: '/onboarding/hybrid',
  ONBOARDING_PRODUCER: '/onboarding/producer',
  ONBOARDING_FAN: '/onboarding/fan',

  // Sessions & collaboration
  SESSIONS: '/sessions',
  SESSIONS_BROWSER: '/sessions-browser',
  CREATE_SESSION: '/create-session',
  HYBRID_DAW: '/hybrid-daw',

  // Community
  COMMUNITY: '/community',
  CROWD: '/crowd',
  PREMIERES: '/premieres',
  LEADERBOARD: '/leaderboard',
  ACHIEVEMENTS: '/achievements',
  UNLOCKABLES: '/unlockables',
  ECONOMY: '/economy',

  // Live streaming
  LIVE: '/live',

  // Services
  SERVICES: '/services',
  SERVICES_MIXING: '/services/mixing',
  SERVICES_MASTERING: '/services/mastering',
  SERVICES_AI_MASTERING: '/services/ai-mastering',
  SERVICES_DISTRIBUTION: '/services/distribution',

  // Engineers
  ENGINEERS: '/engineers',

  // Tools & features
  UPLOAD: '/upload',
  AUDIO_LAB: '/audio-lab',
  BRAND_FORGE: '/brand-forge',
  PRIME_BEAT_FORGE: '/prime-beat-forge',
  PRIME_MARKETING: '/prime-marketing',
  MARKETING_COMMAND_CENTER: '/marketing-command-center',
  JOBS: '/jobs',
  AI_AUDIO_INTELLIGENCE: '/ai-audio-intelligence',

  // Marketplace & commerce
  MARKETPLACE: '/marketplace',
  BEATS: '/beats',
  MY_PURCHASES: '/my-purchases',
  WISHLIST: '/wishlist',
  SELLER_DASHBOARD: '/seller-dashboard',
  LABEL_SERVICES: '/label-services',
  MERCH: '/merch',
  ARTIST_MERCH_MANAGER: '/artist/merch-manager',

  // Settings & utility
  SETTINGS: '/settings',
  NOTIFICATION_PREFERENCES: '/notification-preferences',
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',
  INTEGRATIONS: '/integrations',
  MATCHING: '/matching',
  PARTNER_PROGRAM: '/partner-program',
  FREEMIUM: '/freemium',
  DREAM_ENGINE: '/dream-engine',

  // Payments
  CHECKOUT: '/checkout',
  PAYMENT_SUCCESS: '/payment-success',
  PAYMENT_CANCELED: '/payment-canceled',

  // Misc
  COMING_SOON: '/coming-soon',
  BATTLE_TOURNAMENTS: '/battle-tournaments',
  MY_CERTIFICATIONS: '/my-certifications',
  TUTORIALS: '/tutorials',
  SUNO_TEST: '/suno-test',
  MESSAGING_TEST: '/messaging-test',

  // ─── City ──────────────────────────────────────────────────
  CITY: '/city',
  CITY_TOWER: '/city/tower',
  CITY_STUDIO: '/city/studio',
  CITY_CREATOR: '/city/creator',
  CITY_PRIME: '/city/prime',
  CITY_ANALYTICS: '/city/analytics',
  CITY_COMMERCE: '/city/commerce',
  CITY_BROADCAST: '/city/broadcast',
  CITY_ARENA: '/city/arena',

  // ─── Mobile ────────────────────────────────────────────────
  MOBILE_HOME: '/mobile-home',
  MOBILE_LANDING: '/mobile-landing',
  MOBILE_MIXXBOT: '/mobile-mixxbot',
} as const;

// ─── Dynamic route helpers ───────────────────────────────────
export const sessionRoute = (sessionId: string) => `/session/${sessionId}` as const;
export const collaborateRoute = (sessionId: string) => `/collaborate/${sessionId}` as const;
export const engineerProfileRoute = (userId: string) => `/engineer/${userId}` as const;
export const publicProfileRoute = (usernameOrId: string) => `/u/${usernameOrId}` as const;
export const projectRoute = (projectId: string) => `/project/${projectId}` as const;
export const orderSuccessRoute = (paymentId: string) => `/order-success/${paymentId}` as const;
export const watchStreamRoute = (streamId: string) => `/watch/${streamId}` as const;
export const broadcastRoute = (streamId: string) => `/broadcast/${streamId}` as const;
export const merchStoreRoute = (username: string) => `/merch/${username}` as const;
export const artistStorefrontRoute = (username: string) => `/store/${username}` as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
