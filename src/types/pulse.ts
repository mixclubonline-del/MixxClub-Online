// Pulse System - Energy States
// The platform shifts between modes of engagement, not pages

export type EnergyState = 
  | 'DISCOVER'    // Browsing, exploring - City/Hallway mode
  | 'CREATE'      // Making something - Focused workspace
  | 'COLLABORATE' // Working with others - Real-time session
  | 'MANAGE'      // Business mode - CRM surfaces
  | 'EARN'        // Economy focus - Vault/Marketplace
  | 'CELEBRATE';  // Community wins - Social feed

export interface PulseConfig {
  id: EnergyState;
  label: string;
  description: string;
  color: string;           // HSL color for ambient effects
  icon: string;            // Lucide icon name
  ambientIntensity: number; // 0-1 for background effects
  focusMode: boolean;      // Reduces distractions when true
}

export const PULSE_CONFIGS: Record<EnergyState, PulseConfig> = {
  DISCOVER: {
    id: 'DISCOVER',
    label: 'Discover',
    description: 'Explore the city, find new sounds',
    color: 'hsl(var(--primary))',
    icon: 'Compass',
    ambientIntensity: 0.8,
    focusMode: false,
  },
  CREATE: {
    id: 'CREATE',
    label: 'Create',
    description: 'Build something new',
    color: 'hsl(var(--accent-purple))',
    icon: 'Sparkles',
    ambientIntensity: 0.3,
    focusMode: true,
  },
  COLLABORATE: {
    id: 'COLLABORATE',
    label: 'Collaborate',
    description: 'Work with others in real-time',
    color: 'hsl(var(--accent-blue))',
    icon: 'Users',
    ambientIntensity: 0.5,
    focusMode: true,
  },
  MANAGE: {
    id: 'MANAGE',
    label: 'Manage',
    description: 'Handle your business',
    color: 'hsl(var(--accent-green))',
    icon: 'LayoutDashboard',
    ambientIntensity: 0.2,
    focusMode: false,
  },
  EARN: {
    id: 'EARN',
    label: 'Earn',
    description: 'Economy and marketplace',
    color: 'hsl(var(--accent-gold))',
    icon: 'Coins',
    ambientIntensity: 0.4,
    focusMode: false,
  },
  CELEBRATE: {
    id: 'CELEBRATE',
    label: 'Celebrate',
    description: 'Community wins and recognition',
    color: 'hsl(var(--accent-pink))',
    icon: 'PartyPopper',
    ambientIntensity: 0.9,
    focusMode: false,
  },
};

export interface PulseTransition {
  from: EnergyState;
  to: EnergyState;
  timestamp: number;
  trigger: 'route' | 'action' | 'manual';
  source?: string; // Route path or action name
}

export interface PulseState {
  currentEnergy: EnergyState;
  previousEnergy: EnergyState | null;
  transitionInProgress: boolean;
  transitionHistory: PulseTransition[];
}

// Get config for current energy state
export function getPulseConfig(energy: EnergyState): PulseConfig {
  return PULSE_CONFIGS[energy];
}

// Check if energy state requires focus mode
export function isFocusMode(energy: EnergyState): boolean {
  return PULSE_CONFIGS[energy].focusMode;
}

// Get ambient intensity for current state
export function getAmbientIntensity(energy: EnergyState): number {
  return PULSE_CONFIGS[energy].ambientIntensity;
}
