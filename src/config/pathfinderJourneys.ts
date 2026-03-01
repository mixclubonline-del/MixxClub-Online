/**
 * Pathfinder Journey Definitions
 *
 * Static config for the guided walkthrough system.
 * Each journey is a sequence of steps that move users across the site.
 * Phase 1 ships the Visitor Journey; future phases add entries here.
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

// ─── All journeys registry ───
export const PATHFINDER_JOURNEYS: PathfinderJourney[] = [
  visitorJourney,
  // Phase 2+: add new member, creator, business journeys here
];

export function getJourneyById(id: string): PathfinderJourney | undefined {
  return PATHFINDER_JOURNEYS.find((j) => j.id === id);
}
