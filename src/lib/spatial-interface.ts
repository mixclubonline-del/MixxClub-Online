/**
 * Spatial Interface Doctrine
 * 
 * MixClub doesn't have pages — it has places.
 * Users don't click navigation — they move through space.
 * The interface disappears; the world remains.
 * 
 * Core Principles:
 * 1. Visuals First, Text Confirms - State via lighting/animation, text on hover
 * 2. Navigation is Movement - Districts are locations, not pages
 * 3. Video + Interactive Layers - AI backgrounds + hotspots
 * 4. Novel But Usable - Discoverable, intuitive, efficient
 */

// ============================================
// HOTSPOT STATES
// ============================================

export type HotspotState = 'idle' | 'active' | 'recording' | 'live' | 'waiting';

export interface HotspotConfig {
  id: string;
  position: { x: number; y: number }; // Percentage-based positioning
  state: HotspotState;
  label?: string; // Shown on hover only
  description?: string;
  path?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================
// ANIMATION PRESETS
// ============================================

export const GLOW_ANIMATIONS: Record<HotspotState, { boxShadow: string | string[] }> = {
  idle: {
    boxShadow: '0 0 10px 2px hsl(var(--muted) / 0.3)',
  },
  active: {
    boxShadow: [
      '0 0 20px 5px hsl(var(--primary) / 0.5)',
      '0 0 30px 10px hsl(var(--primary) / 0.3)',
      '0 0 20px 5px hsl(var(--primary) / 0.5)',
    ],
  },
  recording: {
    boxShadow: [
      '0 0 20px 5px hsl(var(--destructive) / 0.5)',
      '0 0 30px 10px hsl(var(--destructive) / 0.3)',
      '0 0 20px 5px hsl(var(--destructive) / 0.5)',
    ],
  },
  live: {
    boxShadow: [
      '0 0 25px 8px hsl(142 76% 36% / 0.5)',
      '0 0 35px 12px hsl(142 76% 36% / 0.3)',
      '0 0 25px 8px hsl(142 76% 36% / 0.5)',
    ],
  },
  waiting: {
    boxShadow: [
      '0 0 15px 3px hsl(var(--muted-foreground) / 0.4)',
      '0 0 20px 5px hsl(var(--muted-foreground) / 0.2)',
      '0 0 15px 3px hsl(var(--muted-foreground) / 0.4)',
    ],
  },
};

export const PULSE_TIMING = {
  idle: { duration: 0 },
  active: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  recording: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  live: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
  waiting: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
} as const;

// ============================================
// DISTRICT POSITIONS (City Map)
// ============================================

export interface DistrictHotspot {
  id: string;
  name: string;
  description: string;
  path: string;
  position: { x: number; y: number };
  size: 'sm' | 'md' | 'lg';
  glowColor: string; // HSL values for the glow
  highlight?: boolean;
}

export const DISTRICT_HOTSPOTS: DistrictHotspot[] = [
  {
    id: 'tower',
    name: 'MixxTech Tower',
    description: 'Central hub - Your command center',
    path: '/city/tower',
    position: { x: 50, y: 42 },
    size: 'lg',
    glowColor: '262 83% 58%', // Primary purple
  },
  {
    id: 'studio',
    name: 'RSD Chamber',
    description: 'AI beat generation & mixing tools',
    path: '/hybrid-daw',
    position: { x: 22, y: 28 },
    size: 'md',
    glowColor: '25 95% 53%', // Orange
    highlight: true,
  },
  {
    id: 'creator',
    name: 'Creator Hub',
    description: 'Upload & manage your music',
    path: '/upload',
    position: { x: 78, y: 25 },
    size: 'md',
    glowColor: '280 65% 60%', // Purple-pink
  },
  {
    id: 'neural',
    name: 'Neural Engine',
    description: 'Prime 4.0 AI assistant',
    path: '/prime-beat-forge',
    position: { x: 18, y: 58 },
    size: 'md',
    glowColor: '190 95% 50%', // Cyan
  },
  {
    id: 'arena',
    name: 'The Arena',
    description: 'Battles, competitions & glory',
    path: '/community?tab=arena',
    position: { x: 82, y: 52 },
    size: 'md',
    glowColor: '350 80% 55%', // Red-pink
  },
  {
    id: 'commerce',
    name: 'Commerce District',
    description: 'Marketplace & revenue streams',
    path: '/marketplace',
    position: { x: 32, y: 72 },
    size: 'md',
    glowColor: '40 95% 55%', // Yellow-orange
  },
  {
    id: 'data',
    name: 'Data Realm',
    description: 'Analytics & insights',
    path: '/dashboard',
    position: { x: 68, y: 68 },
    size: 'md',
    glowColor: '160 84% 40%', // Green
  },
  {
    id: 'broadcast',
    name: 'Broadcast Tower',
    description: 'Distribution & releases',
    path: '/services/distribution',
    position: { x: 50, y: 82 },
    size: 'sm',
    glowColor: '250 75% 60%', // Indigo
  },
];

// ============================================
// ASSET NAMING CONVENTIONS
// ============================================

/**
 * Asset naming pattern: {location}_{state}.{ext}
 * 
 * Examples:
 * - studio_hallway_base.jpg
 * - studio_hallway_active.jpg
 * - city_map_overview.jpg
 * - district_tower_portal.jpg
 * - district_rsd_portal.jpg
 */

export const ASSET_CONTEXTS = [
  'studio_hallway_base',
  'studio_hallway_active',
  'city_map_overview',
  'district_tower',
  'district_rsd',
  'district_creator',
  'district_neural',
  'district_arena',
  'district_commerce',
  'district_data',
  'district_broadcast',
] as const;

export type AssetContext = typeof ASSET_CONTEXTS[number];

// ============================================
// HOTSPOT SIZE UTILITIES
// ============================================

export const HOTSPOT_SIZES = {
  sm: {
    width: 40,
    height: 40,
    iconSize: 16,
    glowSpread: 15,
  },
  md: {
    width: 56,
    height: 56,
    iconSize: 24,
    glowSpread: 25,
  },
  lg: {
    width: 80,
    height: 80,
    iconSize: 32,
    glowSpread: 40,
  },
} as const;

export const getHotspotSize = (size: 'sm' | 'md' | 'lg' = 'md') => HOTSPOT_SIZES[size];

// ============================================
// AMBIENT EFFECTS
// ============================================

export const AMBIENT_PARTICLES = {
  count: 50,
  minSize: 1,
  maxSize: 3,
  minOpacity: 0.1,
  maxOpacity: 0.4,
  minDuration: 20,
  maxDuration: 40,
} as const;

export const FOG_OVERLAY = {
  opacity: 0.15,
  color: 'hsl(var(--background))',
} as const;
