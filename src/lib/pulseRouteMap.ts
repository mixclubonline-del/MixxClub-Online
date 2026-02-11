// Route-to-Energy State Mapping
// Automatically detect energy state from current route

import { EnergyState } from '@/types/pulse';

// Static route mappings
const EXACT_ROUTE_MAP: Record<string, EnergyState> = {
  '/': 'DISCOVER',
  '/city': 'DISCOVER',
  '/city/gates': 'DISCOVER',
  '/sessions': 'DISCOVER',
  '/crowd': 'DISCOVER',
  '/premieres': 'DISCOVER',
  '/discover': 'DISCOVER',
  '/search': 'DISCOVER',
  '/live': 'DISCOVER',

  '/hybrid-daw': 'CREATE',
  '/prime-beat-forge': 'CREATE',
  '/brand-forge': 'CREATE',
  '/upload': 'CREATE',
  '/city/creator-hub': 'CREATE',
  '/audio-lab': 'CREATE',

  '/collaborate': 'COLLABORATE',
  '/city/rsd-chamber': 'COLLABORATE',

  '/artist-crm': 'MANAGE',
  '/engineer-crm': 'MANAGE',
  '/producer-crm': 'MANAGE',
  '/fan-hub': 'MANAGE',
  '/dashboard': 'MANAGE',
  '/settings': 'MANAGE',
  '/jobs': 'MANAGE',
  '/city/tower': 'MANAGE',

  '/marketplace': 'EARN',
  '/economy': 'EARN',
  '/beats': 'EARN',
  '/merch': 'EARN',
  '/city/commerce': 'EARN',

  '/achievements': 'CELEBRATE',
  '/community': 'CELEBRATE',
  '/leaderboard': 'CELEBRATE',
  '/city/arena': 'CELEBRATE',
};

// Pattern-based mappings for dynamic routes
const PATTERN_ROUTE_MAP: Array<{ pattern: RegExp; energy: EnergyState }> = [
  // Session workspace - collaboration mode
  { pattern: /^\/session\/[^/]+$/, energy: 'COLLABORATE' },
  { pattern: /^\/sessions\/[^/]+$/, energy: 'COLLABORATE' },

  // Artist/profile viewing - discovery
  { pattern: /^\/artist\/[^/]+$/, energy: 'DISCOVER' },
  { pattern: /^\/profile\/[^/]+$/, energy: 'DISCOVER' },
  { pattern: /^\/u\/[^/]+$/, energy: 'DISCOVER' },

  // Project management
  { pattern: /^\/projects\/[^/]+$/, energy: 'MANAGE' },
  { pattern: /^\/project\/[^/]+$/, energy: 'MANAGE' },

  // CRM sections
  { pattern: /^\/artist-crm\/.*$/, energy: 'MANAGE' },
  { pattern: /^\/engineer-crm\/.*$/, energy: 'MANAGE' },

  // City districts
  { pattern: /^\/city\/.*$/, energy: 'DISCOVER' },

  // Mobile routes
  { pattern: /^\/mobile-.*$/, energy: 'DISCOVER' },
];

/**
 * Detect energy state from a route path
 */
export function detectEnergyFromRoute(path: string): EnergyState {
  // Check exact matches first
  if (EXACT_ROUTE_MAP[path]) {
    return EXACT_ROUTE_MAP[path];
  }

  // Check pattern matches
  for (const { pattern, energy } of PATTERN_ROUTE_MAP) {
    if (pattern.test(path)) {
      return energy;
    }
  }

  // Default to DISCOVER for unknown routes
  return 'DISCOVER';
}

/**
 * Get all routes for a specific energy state
 */
export function getRoutesForEnergy(energy: EnergyState): string[] {
  return Object.entries(EXACT_ROUTE_MAP)
    .filter(([_, e]) => e === energy)
    .map(([route]) => route);
}

/**
 * Check if a route matches a specific energy state
 */
export function routeMatchesEnergy(path: string, energy: EnergyState): boolean {
  return detectEnergyFromRoute(path) === energy;
}
