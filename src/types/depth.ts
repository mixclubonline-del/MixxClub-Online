/**
 * Depth Layer System - "Puttin' In"
 * 
 * Community-authentic depth layers that honor participation:
 * - Posted Up: In the building, feeling the vibe
 * - In the Room: Signed in, part of the conversation
 * - On the Mic: Contributing, creating, collaborating
 * - On Stage: Who people came to see, IS the energy
 */

export type DepthLayer = 'posted-up' | 'in-the-room' | 'on-the-mic' | 'on-stage';

export interface DepthLayerConfig {
  id: DepthLayer;
  label: string;
  description: string;
  minPuttinIn: number; // Minimum "puttin' in" score to reach this layer
}

export const DEPTH_LAYERS: Record<DepthLayer, DepthLayerConfig> = {
  'posted-up': {
    id: 'posted-up',
    label: 'Posted Up',
    description: 'In the building, feeling the vibe',
    minPuttinIn: 0,
  },
  'in-the-room': {
    id: 'in-the-room',
    label: 'In the Room',
    description: 'Signed in, part of the conversation',
    minPuttinIn: 10,
  },
  'on-the-mic': {
    id: 'on-the-mic',
    label: 'On the Mic',
    description: 'Contributing, creating, collaborating',
    minPuttinIn: 100,
  },
  'on-stage': {
    id: 'on-stage',
    label: 'On Stage',
    description: 'Who people came to see, IS the energy',
    minPuttinIn: 500,
  },
};

/**
 * "Puttin' In" - The Five Pillars of Community Investment
 * 
 * Not transactional. Not asking. Just recognizing what people already do.
 * What's understood doesn't need to be said.
 */
export interface PuttinInMetrics {
  time: number;      // Hours posted up in the building
  attention: number; // Artists followed, sessions watched, content engaged
  support: number;   // Day 1 badges, early access, community backing
  work: number;      // Portfolio pieces, session credits, collaborations
  love: number;      // Community standing, reputation, the intangibles
}

export interface PuttinInScore {
  total: number;
  breakdown: PuttinInMetrics;
  currentLayer: DepthLayer;
  nextLayer: DepthLayer | null;
  progressToNext: number; // 0-100 percentage
}

/**
 * Day 1 Recognition - For fans who put in early
 */
export interface Day1Status {
  artistId: string;
  artistName: string;
  since: string; // ISO date
  puttinInAtTime: number; // Their score when they became a Day 1
}

/**
 * What each layer can see/do
 */
export interface LayerCapabilities {
  canSeeHallway: boolean;
  canSeeWhosBehindDoors: boolean;
  canKnock: boolean;
  canEnterSessions: boolean;
  canHostSessions: boolean;
  canBeThGlow: boolean; // Their room visible to lower layers
  canAccessCRM: boolean;
  canEarnMixxCoinz: boolean;
}

export const LAYER_CAPABILITIES: Record<DepthLayer, LayerCapabilities> = {
  'posted-up': {
    canSeeHallway: true,
    canSeeWhosBehindDoors: false,
    canKnock: false,
    canEnterSessions: false,
    canHostSessions: false,
    canBeThGlow: false,
    canAccessCRM: false,
    canEarnMixxCoinz: false,
  },
  'in-the-room': {
    canSeeHallway: true,
    canSeeWhosBehindDoors: true,
    canKnock: true,
    canEnterSessions: false,
    canHostSessions: false,
    canBeThGlow: false,
    canAccessCRM: false,
    canEarnMixxCoinz: true,
  },
  'on-the-mic': {
    canSeeHallway: true,
    canSeeWhosBehindDoors: true,
    canKnock: true,
    canEnterSessions: true,
    canHostSessions: true,
    canBeThGlow: false,
    canAccessCRM: true,
    canEarnMixxCoinz: true,
  },
  'on-stage': {
    canSeeHallway: true,
    canSeeWhosBehindDoors: true,
    canKnock: true,
    canEnterSessions: true,
    canHostSessions: true,
    canBeThGlow: true,
    canAccessCRM: true,
    canEarnMixxCoinz: true,
  },
};

/**
 * Get capabilities for a given depth layer
 */
export function getCapabilities(layer: DepthLayer): LayerCapabilities {
  return LAYER_CAPABILITIES[layer];
}

/**
 * Check if a layer has a specific capability
 */
export function hasCapability(
  layer: DepthLayer,
  capability: keyof LayerCapabilities
): boolean {
  return LAYER_CAPABILITIES[layer][capability];
}

/**
 * Get the next layer after the current one
 */
export function getNextLayer(current: DepthLayer): DepthLayer | null {
  const layers: DepthLayer[] = ['posted-up', 'in-the-room', 'on-the-mic', 'on-stage'];
  const currentIndex = layers.indexOf(current);
  return currentIndex < layers.length - 1 ? layers[currentIndex + 1] : null;
}

/**
 * Determine depth layer from puttin' in score
 */
export function getLayerFromScore(score: number): DepthLayer {
  if (score >= DEPTH_LAYERS['on-stage'].minPuttinIn) return 'on-stage';
  if (score >= DEPTH_LAYERS['on-the-mic'].minPuttinIn) return 'on-the-mic';
  if (score >= DEPTH_LAYERS['in-the-room'].minPuttinIn) return 'in-the-room';
  return 'posted-up';
}
