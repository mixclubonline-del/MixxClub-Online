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
  | 'DEEP_LINK';           // External/share link entry

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

// Union type for all payloads
export type FlowPayload =
  | EnterCityPayload
  | EnterDistrictPayload
  | EnterSessionPayload
  | AuthenticatePayload
  | CompleteAuthPayload
  | SwitchRolePayload
  | DeepLinkPayload
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

// Intents that require authentication
export const AUTH_REQUIRED_INTENTS: FlowIntentType[] = [
  'ENTER_DISTRICT',
  'ENTER_SESSION',
  'SWITCH_ROLE',
];

// Intents that require a specific role
export const ROLE_REQUIRED_INTENTS: FlowIntentType[] = [
  'ENTER_SESSION',
];
