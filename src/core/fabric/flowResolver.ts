// Flow Resolver - Pure logic that converts intents to resolved routes
// This is the "brain" of the Flow system - all navigation decisions happen here

import {
  FlowIntent,
  FlowPayload,
  EnterCityPayload,
  EnterDistrictPayload,
  CompleteAuthPayload,
  AuthenticatePayload,
  SwitchRolePayload,
  DeepLinkPayload,
  NavigateToPayload,
  OpenCRMPayload,
  OpenStudioPayload,
  ViewProjectPayload,
  ViewEngineerPayload,
  ViewStorePayload,
  BrowseSectionPayload,
  DISTRICT_ROUTES,
  SECTION_ROUTES,
  AUTH_REQUIRED_INTENTS,
  PUBLIC_INTENTS,
  isEnterCityIntent,
  isEnterDistrictIntent,
  isCompleteAuthIntent,
  isNavigateToIntent,
  isDeepLinkIntent,
} from './flowIntents';
import { FlowUserContext, FlowBlockReason } from './flowStore';

// Resolution result types
export interface ResolvedRoute {
  blocked: false;
  route: string;
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
  sideEffects?: Array<() => void>;
  replace?: boolean;
}

export interface FlowBlock {
  blocked: true;
  reason: FlowBlockReason;
  redirect?: string;
  message?: string;
}

export type ResolutionResult = ResolvedRoute | FlowBlock;

/**
 * Main resolver function - processes an intent and returns a route or block
 */
export function resolveIntent(
  intent: FlowIntent,
  context: FlowUserContext
): ResolutionResult {
  // Step 1: Validate intent
  const validationResult = validateIntent(intent);
  if (validationResult) {
    return validationResult;
  }

  // Step 2: Check auth guard (skip for public intents)
  if (requiresAuth(intent) && !context.isAuthenticated) {
    return {
      blocked: true,
      reason: 'auth_required',
      redirect: `/auth?redirect=${encodeURIComponent(getIntentRoute(intent))}`,
      message: 'Please sign in to continue',
    };
  }

  // Step 3: Check role guard
  const roleCheck = checkRoleGuard(intent, context);
  if (roleCheck) {
    return roleCheck;
  }

  // Step 4: Resolve to route
  return mapIntentToRoute(intent, context);
}

/**
 * Validate intent structure and payload
 */
function validateIntent(intent: FlowIntent): FlowBlock | null {
  if (!intent.type) {
    return {
      blocked: true,
      reason: 'invalid_intent',
      message: 'Intent type is required',
    };
  }

  // Validate specific intent payloads
  switch (intent.type) {
    case 'ENTER_CITY':
      if (!isEnterCityIntent(intent) || !intent.payload?.role) {
        return {
          blocked: true,
          reason: 'invalid_intent',
          message: 'ENTER_CITY requires a role payload',
        };
      }
      break;
      
    case 'ENTER_DISTRICT':
      if (!isEnterDistrictIntent(intent) || !intent.payload?.districtId) {
        return {
          blocked: true,
          reason: 'invalid_intent',
          message: 'ENTER_DISTRICT requires a districtId payload',
        };
      }
      break;

    case 'NAVIGATE_TO':
    case 'DEEP_LINK':
      if (!intent.payload || !('path' in intent.payload)) {
        return {
          blocked: true,
          reason: 'invalid_intent',
          message: `${intent.type} requires a path payload`,
        };
      }
      break;
  }

  return null;
}

/**
 * Check if intent requires authentication
 */
function requiresAuth(intent: FlowIntent): boolean {
  // Public intents never require auth
  if (PUBLIC_INTENTS.includes(intent.type)) {
    return false;
  }
  return AUTH_REQUIRED_INTENTS.includes(intent.type);
}

/**
 * Check role-based access
 */
function checkRoleGuard(intent: FlowIntent, context: FlowUserContext): FlowBlock | null {
  // Currently no strict role requirements, but structure is in place
  // Future: certain districts could be role-locked
  return null;
}

/**
 * Map intent to actual route path
 */
function mapIntentToRoute(intent: FlowIntent, context: FlowUserContext): ResolvedRoute {
  switch (intent.type) {
    case 'ENTER_CITY': {
      const payload = intent.payload as EnterCityPayload;
      // Store role preference as side effect
      const sideEffects = [
        () => localStorage.setItem('mixclub_role', payload.role),
      ];
      return {
        blocked: false,
        route: '/city/tower',
        transition: 'zoom',
        sideEffects,
      };
    }

    case 'ENTER_DISTRICT': {
      const payload = intent.payload as EnterDistrictPayload;
      const route = DISTRICT_ROUTES[payload.districtId] || '/city/tower';
      return {
        blocked: false,
        route,
        transition: 'slide',
      };
    }

    case 'AUTHENTICATE': {
      const payload = intent.payload as AuthenticatePayload;
      let route = '/auth';
      if (payload.mode) {
        route += `?mode=${payload.mode}`;
      }
      if (payload.redirectAfter) {
        route += `${payload.mode ? '&' : '?'}redirect=${encodeURIComponent(payload.redirectAfter)}`;
      }
      return {
        blocked: false,
        route,
        transition: 'fade',
      };
    }

    case 'COMPLETE_AUTH': {
      const payload = intent.payload as CompleteAuthPayload;
      // Determine destination based on priority
      let route = '/dashboard';
      
      if (payload.destination) {
        route = payload.destination;
      } else if (payload.role === 'engineer') {
        route = '/engineer-crm';
      } else if (payload.role === 'artist') {
        route = '/artist-crm';
      }
      
      return {
        blocked: false,
        route,
        transition: 'zoom',
      };
    }

    case 'EXIT_TO_GATE':
      return {
        blocked: false,
        route: '/city',
        transition: 'fade',
      };

    case 'GO_BACK':
      // Use browser history
      return {
        blocked: false,
        route: context.lastDistrict 
          ? DISTRICT_ROUTES[context.lastDistrict] || '/city/tower'
          : '/city/tower',
        transition: 'slide',
      };

    case 'SWITCH_ROLE': {
      const payload = intent.payload as SwitchRolePayload;
      const sideEffects = [
        () => localStorage.setItem('mixclub_role', payload.newRole),
      ];
      // Stay on current page or go to role-specific CRM
      const route = payload.preserveLocation 
        ? (context.lastDistrict ? DISTRICT_ROUTES[context.lastDistrict] : '/city/tower')
        : (payload.newRole === 'engineer' ? '/engineer-crm' : '/artist-crm');
      return {
        blocked: false,
        route,
        transition: 'fade',
        sideEffects,
      };
    }

    case 'DEEP_LINK': {
      const payload = intent.payload as DeepLinkPayload;
      let route = payload.path;
      if (payload.params) {
        const params = new URLSearchParams(payload.params).toString();
        route += `?${params}`;
      }
      return {
        blocked: false,
        route,
        transition: 'fade',
      };
    }

    case 'NAVIGATE_TO': {
      const payload = intent.payload as NavigateToPayload;
      return {
        blocked: false,
        route: payload.path,
        transition: 'fade',
        replace: payload.replace,
      };
    }

    case 'ENTER_SESSION': {
      const payload = intent.payload as { sessionId: string };
      return {
        blocked: false,
        route: `/session/${payload.sessionId}`,
        transition: 'zoom',
      };
    }

    case 'OPEN_CRM': {
      const payload = intent.payload as OpenCRMPayload;
      let route = payload.role === 'engineer' ? '/engineer-crm' : '/artist-crm';
      const params = new URLSearchParams();
      if (payload.tab) params.set('tab', payload.tab);
      if (payload.contact) params.set('contact', payload.contact);
      const paramStr = params.toString();
      if (paramStr) route += `?${paramStr}`;
      return {
        blocked: false,
        route,
        transition: 'slide',
      };
    }

    case 'OPEN_STUDIO': {
      const payload = intent.payload as OpenStudioPayload;
      let route = '/prostudio';
      if (payload.projectId) {
        route = `/prostudio/${payload.projectId}`;
      }
      if (payload.mode === 'mastering') {
        route = '/ai-mastering';
      }
      return {
        blocked: false,
        route,
        transition: 'zoom',
      };
    }

    case 'OPEN_MARKETPLACE':
      return {
        blocked: false,
        route: '/marketplace',
        transition: 'slide',
      };

    case 'OPEN_PROFILE':
      return {
        blocked: false,
        route: '/profile',
        transition: 'fade',
      };

    case 'OPEN_SETTINGS':
      return {
        blocked: false,
        route: '/settings',
        transition: 'fade',
      };

    case 'OPEN_PRICING':
      return {
        blocked: false,
        route: '/pricing',
        transition: 'fade',
      };

    case 'START_UPLOAD':
      return {
        blocked: false,
        route: '/upload',
        transition: 'zoom',
      };

    case 'VIEW_PROJECT': {
      const payload = intent.payload as ViewProjectPayload;
      return {
        blocked: false,
        route: `/project/${payload.projectId}`,
        transition: 'slide',
      };
    }

    case 'VIEW_ENGINEER': {
      const payload = intent.payload as ViewEngineerPayload;
      return {
        blocked: false,
        route: `/engineer/${payload.engineerId}`,
        transition: 'slide',
      };
    }

    case 'VIEW_STORE': {
      const payload = intent.payload as ViewStorePayload;
      return {
        blocked: false,
        route: `/store/${payload.slug}`,
        transition: 'slide',
      };
    }

    case 'START_CHECKOUT':
      return {
        blocked: false,
        route: '/checkout',
        transition: 'fade',
      };

    case 'BROWSE_SECTION': {
      const payload = intent.payload as BrowseSectionPayload;
      const route = SECTION_ROUTES[payload.section] || '/';
      return {
        blocked: false,
        route,
        transition: 'fade',
      };
    }

    default:
      return {
        blocked: false,
        route: '/city/tower',
        transition: 'fade',
      };
  }
}

/**
 * Get the intended route for an intent (used for redirect URLs)
 */
function getIntentRoute(intent: FlowIntent): string {
  switch (intent.type) {
    case 'ENTER_DISTRICT': {
      const payload = intent.payload as EnterDistrictPayload;
      return DISTRICT_ROUTES[payload.districtId] || '/city/tower';
    }
    case 'ENTER_SESSION': {
      const payload = intent.payload as { sessionId: string };
      return `/session/${payload.sessionId}`;
    }
    case 'NAVIGATE_TO':
    case 'DEEP_LINK': {
      const payload = intent.payload as { path: string };
      return payload.path;
    }
    case 'OPEN_CRM': {
      const payload = intent.payload as OpenCRMPayload;
      return payload.role === 'engineer' ? '/engineer-crm' : '/artist-crm';
    }
    case 'OPEN_STUDIO':
      return '/prostudio';
    case 'OPEN_MARKETPLACE':
      return '/marketplace';
    case 'VIEW_PROJECT': {
      const payload = intent.payload as ViewProjectPayload;
      return `/project/${payload.projectId}`;
    }
    default:
      return '/city/tower';
  }
}

/**
 * Execute side effects from resolution
 */
export function executeSideEffects(result: ResolvedRoute): void {
  if (result.sideEffects) {
    result.sideEffects.forEach((effect) => {
      try {
        effect();
      } catch (error) {
        console.error('Flow side effect error:', error);
      }
    });
  }
}
