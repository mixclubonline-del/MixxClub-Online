// Flow Intent Definitions - The vocabulary of movement through MixxClub City
// These are the ONLY valid ways to express navigation intent

export type FlowIntentType =
  | 'ENTER_CITY'           // First-time gate selection (artist/engineer)
  | 'ENTER_DISTRICT'       // Navigate to a city district
  | 'ENTER_SESSION'        // Join a collaboration session
  | 'AUTHENTICATE'         // Sign in/sign up flow
  | 'COMPLETE_AUTH'        // Auth success, route to destination
  | 'EXIT_TO_GATE'         // Return to city gates
  | 'GO_BACK'              // Browser back navigation
  | 'SWITCH_ROLE'          // Hybrid user role switch
  | 'DEEP_LINK'            // External/share link entry - THE UNIVERSAL FALLBACK
  // Extended vocabulary for full app coverage
  | 'NAVIGATE_TO'          // Generic navigation (with route string)
  | 'OPEN_CRM'             // Open artist/engineer CRM portal
  | 'OPEN_STUDIO'          // Open ProStudio DAW
  | 'OPEN_MARKETPLACE'     // Open marketplace
  | 'OPEN_PROFILE'         // Open user profile
  | 'OPEN_SETTINGS'        // Open settings
  | 'OPEN_PRICING'         // Open pricing page
  | 'START_UPLOAD'         // Start upload flow
  | 'VIEW_PROJECT'         // View a specific project
  | 'VIEW_ENGINEER'        // View engineer profile
  | 'VIEW_STORE'           // View storefront
  | 'START_CHECKOUT'       // Begin checkout flow
  | 'BROWSE_SECTION';      // Browse a section (how-it-works, about, etc.)

export type FlowPriority = 'low' | 'normal' | 'high' | 'critical';

// Payload types for each intent
export interface EnterCityPayload {
  role: 'artist' | 'engineer';
}

export interface EnterDistrictPayload {
  districtId: string;
  fromDistrict?: string;
}

export interface EnterSessionPayload {
  sessionId: string;
  sessionType?: 'collaboration' | 'live' | 'review';
}

export interface AuthenticatePayload {
  mode: 'login' | 'signup' | 'reset';
  redirectAfter?: string;
}

export interface CompleteAuthPayload {
  destination?: string;
  role?: 'artist' | 'engineer';
}

export interface SwitchRolePayload {
  newRole: 'artist' | 'engineer';
  preserveLocation?: boolean;
}

export interface DeepLinkPayload {
  path: string;
  params?: Record<string, string>;
}

// Extended payload types
export interface NavigateToPayload {
  path: string;
  replace?: boolean;
}

export interface OpenCRMPayload {
  role: 'artist' | 'engineer';
  tab?: string;
  contact?: string;
}

export interface OpenStudioPayload {
  projectId?: string;
  mode?: 'daw' | 'mixer' | 'mastering';
}

export interface ViewProjectPayload {
  projectId: string;
}

export interface ViewEngineerPayload {
  engineerId: string;
}

export interface ViewStorePayload {
  slug: string;
}

export interface BrowseSectionPayload {
  section: 'how-it-works' | 'about' | 'pricing' | 'faq' | 'careers' | 'contact' | 'legal';
}

// Union type for all payloads
export type FlowPayload =
  | EnterCityPayload
  | EnterDistrictPayload
  | EnterSessionPayload
  | AuthenticatePayload
  | CompleteAuthPayload
  | SwitchRolePayload
  | DeepLinkPayload
  | NavigateToPayload
  | OpenCRMPayload
  | OpenStudioPayload
  | ViewProjectPayload
  | ViewEngineerPayload
  | ViewStorePayload
  | BrowseSectionPayload
  | Record<string, unknown>
  | undefined;

// The canonical Flow Intent structure
export interface FlowIntent<T extends FlowPayload = FlowPayload> {
  type: FlowIntentType;
  payload: T;
  source: string;           // Component or system that created the intent
  timestamp: number;
  priority: FlowPriority;
  id: string;               // Unique identifier for tracking
}

// Intent creation helper
let intentCounter = 0;

export function createIntent<T extends FlowPayload>(
  type: FlowIntentType,
  payload: T,
  source: string,
  priority: FlowPriority = 'normal'
): FlowIntent<T> {
  return {
    type,
    payload,
    source,
    timestamp: Date.now(),
    priority,
    id: `intent_${Date.now()}_${++intentCounter}`,
  };
}

// Intent type guards
export function isEnterCityIntent(intent: FlowIntent): intent is FlowIntent<EnterCityPayload> {
  return intent.type === 'ENTER_CITY';
}

export function isEnterDistrictIntent(intent: FlowIntent): intent is FlowIntent<EnterDistrictPayload> {
  return intent.type === 'ENTER_DISTRICT';
}

export function isAuthIntent(intent: FlowIntent): intent is FlowIntent<AuthenticatePayload> {
  return intent.type === 'AUTHENTICATE';
}

export function isCompleteAuthIntent(intent: FlowIntent): intent is FlowIntent<CompleteAuthPayload> {
  return intent.type === 'COMPLETE_AUTH';
}

export function isNavigateToIntent(intent: FlowIntent): intent is FlowIntent<NavigateToPayload> {
  return intent.type === 'NAVIGATE_TO';
}

export function isDeepLinkIntent(intent: FlowIntent): intent is FlowIntent<DeepLinkPayload> {
  return intent.type === 'DEEP_LINK';
}

// District ID to route mapping
export const DISTRICT_ROUTES: Record<string, string> = {
  'tower': '/city/tower',
  'gates': '/city',
  'creator': '/city/creator',
  'studio': '/city/studio',
  'rsd': '/city/studio',
  'dream': '/city/dream',
  'neural': '/city/prime',
  'prime': '/city/prime',
  'data': '/city/analytics',
  'analytics': '/city/analytics',
  'commerce': '/city/commerce',
  'broadcast': '/city/broadcast',
  'arena': '/city/arena',
  'apartments': '/city/profile',
  'profile': '/city/profile',
};

// Section routes for BROWSE_SECTION intent
export const SECTION_ROUTES: Record<string, string> = {
  'how-it-works': '/how-it-works',
  'about': '/about',
  'pricing': '/pricing',
  'faq': '/faq',
  'careers': '/careers',
  'contact': '/contact',
  'legal': '/legal',
};

// Intents that require authentication
export const AUTH_REQUIRED_INTENTS: FlowIntentType[] = [
  'ENTER_DISTRICT',
  'ENTER_SESSION',
  'SWITCH_ROLE',
  'OPEN_CRM',
  'OPEN_STUDIO',
  'VIEW_PROJECT',
  'START_UPLOAD',
  'START_CHECKOUT',
];

// Intents that require a specific role
export const ROLE_REQUIRED_INTENTS: FlowIntentType[] = [
  'ENTER_SESSION',
];

// PUBLIC intents that never require auth
export const PUBLIC_INTENTS: FlowIntentType[] = [
  'AUTHENTICATE',
  'BROWSE_SECTION',
  'OPEN_PRICING',
  'VIEW_ENGINEER',
  'VIEW_STORE',
  'DEEP_LINK',
  'NAVIGATE_TO',
];
