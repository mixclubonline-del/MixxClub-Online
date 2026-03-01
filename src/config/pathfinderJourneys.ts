/**
 * Pathfinder Journey Definitions
 *
 * Static config for the guided walkthrough system.
 * Each journey is a sequence of steps that move users across the site.
 * Phase 1: Visitor Journey
 * Phase 2: Role-specific New Member Journeys
 */

import type { SceneId } from '@/stores/sceneFlowStore';

export interface PathfinderStep {
  id: string;
  route: string;
  /** For steps on `/` that target a specific scene */
  sceneHint?: SceneId;
  title: string;
  description: string;
  icon: string; // lucide icon name
  /** Action label on the CTA button */
  actionLabel?: string;
}

export interface PathfinderJourney {
  id: string;
  title: string;
  description: string;
  steps: PathfinderStep[];
  /** Only show to users with one of these roles (undefined = everyone) */
  roles?: string[];
  /** Minimum phase — future phases gate on this */
  phase: number;
}

// ─── Phase 1: Visitor Journey ───
const visitorJourney: PathfinderJourney = {
  id: 'visitor',
  title: 'Explore Mixxclub',
  description: 'Your first tour through the platform',
  phase: 1,
  steps: [
    {
      id: 'hallway',
      route: '/',
      sceneHint: 'HALLWAY',
      title: 'The Front Door',
      description: 'This is the Hallway — tap Enter or click to step inside.',
      icon: 'door-open',
      actionLabel: 'Step Inside',
    },
    {
      id: 'demo',
      route: '/',
      sceneHint: 'DEMO',
      title: 'The Sound',
      description: 'This is what Mixxclub sounds like. Let it play, or skip ahead.',
      icon: 'headphones',
      actionLabel: 'Listen',
    },
    {
      id: 'club',
      route: '/',
      sceneHint: 'INFO',
      title: 'The Club',
      description: 'Scroll through the rooms to see what\'s inside.',
      icon: 'layout-grid',
      actionLabel: 'Explore Rooms',
    },
    {
      id: 'mastering',
      route: '/go',
      title: 'AI Mastering',
      description: 'Try our mastering engine — upload a track or use the demo.',
      icon: 'wand-sparkles',
      actionLabel: 'Try It',
    },
    {
      id: 'quickstart',
      route: '/start',
      title: 'Join Up',
      description: 'Ready? Pick your role and create your account.',
      icon: 'rocket',
      actionLabel: 'Get Started',
    },
  ],
};

// ─── Phase 2: Role-Specific New Member Journeys ───

const artistJourney: PathfinderJourney = {
  id: 'artist-new-member',
  title: 'Your Studio Tour',
  description: 'Get set up as an artist on Mixxclub',
  phase: 2,
  roles: ['artist'],
  steps: [
    {
      id: 'artist-dashboard',
      route: '/artist-crm',
      title: 'Your Dashboard',
      description: 'Career stats, projects, and quick actions live here.',
      icon: 'bar-chart-3',
      actionLabel: 'Open Dashboard',
    },
    {
      id: 'artist-mastering',
      route: '/go',
      title: 'AI Mastering',
      description: 'Polish your tracks with our mastering engine.',
      icon: 'wand-sparkles',
      actionLabel: 'Try It',
    },
    {
      id: 'artist-mixing',
      route: '/services/mixing',
      title: 'Mixing Services',
      description: 'Find engineers and book mixing sessions.',
      icon: 'mic-2',
      actionLabel: 'Browse Engineers',
    },
    {
      id: 'artist-community',
      route: '/community',
      title: 'Community',
      description: 'Connect with producers, engineers, and fans.',
      icon: 'users',
      actionLabel: 'Explore',
    },
    {
      id: 'artist-economy',
      route: '/economy',
      title: 'MixxCoinz',
      description: 'Earn and spend coins across the platform.',
      icon: 'coins',
      actionLabel: 'View Economy',
    },
  ],
};

const engineerJourney: PathfinderJourney = {
  id: 'engineer-new-member',
  title: 'Your Client Setup',
  description: 'Get set up as an engineer on Mixxclub',
  phase: 2,
  roles: ['engineer'],
  steps: [
    {
      id: 'engineer-dashboard',
      route: '/engineer-crm',
      title: 'Your Dashboard',
      description: 'Client management, sessions, and earnings.',
      icon: 'briefcase',
      actionLabel: 'Open Dashboard',
    },
    {
      id: 'engineer-clients',
      route: '/engineer-crm?tab=clients',
      title: 'Client Hub',
      description: 'Manage your client roster and projects.',
      icon: 'users',
      actionLabel: 'View Clients',
    },
    {
      id: 'engineer-mastering',
      route: '/go',
      title: 'AI Mastering',
      description: 'Use our mastering engine on client tracks.',
      icon: 'wand-sparkles',
      actionLabel: 'Try It',
    },
    {
      id: 'engineer-jobs',
      route: '/jobs',
      title: 'Job Board',
      description: 'Find mixing and mastering gigs.',
      icon: 'radio',
      actionLabel: 'Browse Jobs',
    },
    {
      id: 'engineer-community',
      route: '/community',
      title: 'Community',
      description: 'Network and build your reputation.',
      icon: 'users',
      actionLabel: 'Explore',
    },
  ],
};

const producerJourney: PathfinderJourney = {
  id: 'producer-new-member',
  title: 'Your Beat Lab',
  description: 'Get set up as a producer on Mixxclub',
  phase: 2,
  roles: ['producer'],
  steps: [
    {
      id: 'producer-dashboard',
      route: '/producer-crm',
      title: 'Your Dashboard',
      description: 'Beat catalog, sales, and analytics.',
      icon: 'disc-3',
      actionLabel: 'Open Dashboard',
    },
    {
      id: 'producer-catalog',
      route: '/producer-crm?tab=catalog',
      title: 'Beat Catalog',
      description: 'Manage and upload your beats.',
      icon: 'music',
      actionLabel: 'View Catalog',
    },
    {
      id: 'producer-marketplace',
      route: '/marketplace',
      title: 'Beat Store',
      description: 'List beats for sale in the marketplace.',
      icon: 'shopping-bag',
      actionLabel: 'Open Store',
    },
    {
      id: 'producer-mastering',
      route: '/go',
      title: 'AI Mastering',
      description: 'Master your beats before publishing.',
      icon: 'wand-sparkles',
      actionLabel: 'Try It',
    },
    {
      id: 'producer-economy',
      route: '/economy',
      title: 'MixxCoinz',
      description: 'Track your earnings and rewards.',
      icon: 'coins',
      actionLabel: 'View Economy',
    },
  ],
};

const fanJourney: PathfinderJourney = {
  id: 'fan-new-member',
  title: 'Your Fan Pass',
  description: 'Discover what Mixxclub has for you',
  phase: 2,
  roles: ['fan'],
  steps: [
    {
      id: 'fan-feed',
      route: '/fan-hub',
      title: 'Your Feed',
      description: 'Discover new music and creators.',
      icon: 'heart',
      actionLabel: 'Open Feed',
    },
    {
      id: 'fan-day1s',
      route: '/fan-hub?tab=day1s',
      title: 'Day 1s',
      description: 'Support artists early and earn rewards.',
      icon: 'compass',
      actionLabel: 'Explore Day 1s',
    },
    {
      id: 'fan-community',
      route: '/community',
      title: 'Community',
      description: 'Join conversations and battles.',
      icon: 'users',
      actionLabel: 'Explore',
    },
    {
      id: 'fan-economy',
      route: '/economy',
      title: 'MixxCoinz',
      description: 'Earn coins through engagement missions.',
      icon: 'coins',
      actionLabel: 'View Economy',
    },
  ],
};

// ─── All journeys registry ───
export const PATHFINDER_JOURNEYS: PathfinderJourney[] = [
  visitorJourney,
  artistJourney,
  engineerJourney,
  producerJourney,
  fanJourney,
];

export function getJourneyById(id: string): PathfinderJourney | undefined {
  return PATHFINDER_JOURNEYS.find((j) => j.id === id);
}

export function getJourneyForRole(role: string): PathfinderJourney | undefined {
  return PATHFINDER_JOURNEYS.find((j) => j.phase === 2 && j.roles?.includes(role));
}
