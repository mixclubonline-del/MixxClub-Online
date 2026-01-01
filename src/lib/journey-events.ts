import { supabase } from "@/integrations/supabase/client";

// Journey event types
export type JourneyEventType = 
  | 'journey.started'
  | 'journey.step_completed'
  | 'journey.completed'
  | 'user.signup'
  | 'user.profile_updated'
  | 'user.level_up'
  | 'audio.uploaded'
  | 'session.created'
  | 'session.joined'
  | 'session.completed'
  | 'project.created'
  | 'project.completed'
  | 'review.given'
  | 'review.received'
  | 'referral.sent'
  | 'referral.completed'
  | 'payment.completed'
  | 'engineer.verified'
  | 'engineer.matched'
  | 'engineer.booked';

export interface JourneyEventPayload {
  event: JourneyEventType;
  userId: string;
  journeyId?: string;
  stepId?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

interface JourneyEventOptions {
  sendToN8n?: boolean;
  trackAnalytics?: boolean;
}

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

/**
 * Emit a journey event to track user progress and trigger automations
 */
export async function emitJourneyEvent(
  payload: JourneyEventPayload,
  options: JourneyEventOptions = { sendToN8n: true, trackAnalytics: true }
): Promise<void> {
  const eventData = {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
  };

  console.log('[JourneyEvent]', eventData.event, eventData);

  // Track in analytics
  if (options.trackAnalytics) {
    try {
      await supabase.functions.invoke('track-analytics-event', {
        body: {
          eventName: eventData.event,
          eventData: eventData.metadata,
          userId: eventData.userId,
        },
      });
    } catch (error) {
      console.error('[JourneyEvent] Analytics tracking failed:', error);
    }
  }

  // Send to n8n webhook if configured
  if (options.sendToN8n && N8N_WEBHOOK_URL) {
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.error('[JourneyEvent] n8n webhook failed:', error);
    }
  }
}

/**
 * Track journey step completion
 */
export async function completeJourneyStep(
  userId: string,
  journeyId: string,
  stepId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await emitJourneyEvent({
    event: 'journey.step_completed',
    userId,
    journeyId,
    stepId,
    metadata,
  });

  // Update journey state in database
  try {
    const { data: existingJourney } = await (supabase
      .from('user_journeys' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('journey_type', journeyId)
      .single() as any);

    if (existingJourney) {
      await (supabase
        .from('user_journeys' as any)
        .update({
          current_step: stepId,
          metadata: {
            ...(existingJourney.metadata as Record<string, any> || {}),
            ...metadata,
            last_step_completed_at: new Date().toISOString(),
          },
        })
        .eq('id', existingJourney.id) as any);
    }
  } catch (error) {
    console.error('[JourneyEvent] Failed to update journey state:', error);
  }
}

/**
 * Start a new journey for a user
 */
export async function startJourney(
  userId: string,
  journeyId: string,
  initialStep: string = 'welcome',
  metadata?: Record<string, any>
): Promise<void> {
  // Check if journey already exists
  const { data: existing } = await (supabase
    .from('user_journeys' as any)
    .select('id')
    .eq('user_id', userId)
    .eq('journey_type', journeyId)
    .single() as any);

  if (existing) {
    console.log('[JourneyEvent] Journey already exists:', journeyId);
    return;
  }

  // Create journey record
  await (supabase.from('user_journeys' as any).insert({
    user_id: userId,
    journey_type: journeyId,
    current_step: initialStep,
    metadata: metadata || {},
  }) as any);

  await emitJourneyEvent({
    event: 'journey.started',
    userId,
    journeyId,
    stepId: initialStep,
    metadata,
  });
}

/**
 * Complete a journey
 */
export async function completeJourney(
  userId: string,
  journeyId: string,
  metadata?: Record<string, any>
): Promise<void> {
  await (supabase
    .from('user_journeys' as any)
    .update({
      completed_at: new Date().toISOString(),
      metadata: {
        ...metadata,
        completed: true,
      },
    })
    .eq('user_id', userId)
    .eq('journey_type', journeyId) as any);

  await emitJourneyEvent({
    event: 'journey.completed',
    userId,
    journeyId,
    metadata,
  });
}

// Predefined journey definitions
export const JOURNEYS = {
  ARTIST_ONBOARDING: {
    id: 'artist_onboarding',
    name: 'Artist First Week',
    description: 'Complete your first week as an artist on MixClub',
    steps: [
      { id: 'welcome', name: 'Welcome', xp: 10 },
      { id: 'profile_complete', name: 'Complete Profile', xp: 50 },
      { id: 'first_upload', name: 'First Upload', xp: 50 },
      { id: 'engineer_discovery', name: 'Find an Engineer', xp: 25 },
      { id: 'first_session', name: 'First Session', xp: 100 },
    ],
  },
  ENGINEER_ACTIVATION: {
    id: 'engineer_activation',
    name: 'Engineer Launch',
    description: 'Launch your engineering career on MixClub',
    steps: [
      { id: 'verification', name: 'Get Verified', xp: 25 },
      { id: 'portfolio_setup', name: 'Setup Portfolio', xp: 50 },
      { id: 'first_match', name: 'First Match', xp: 50 },
      { id: 'first_booking', name: 'First Booking', xp: 100 },
      { id: 'first_review', name: 'First Review', xp: 75 },
    ],
  },
  PRODUCERS_QUEST: {
    id: 'producers_quest',
    name: "Producer's Journey",
    description: 'Master the art of production from beat to release',
    steps: [
      { id: 'beat_upload', name: 'Drop Your First Beat', xp: 50 },
      { id: 'collab_invite', name: 'Invite a Collaborator', xp: 50 },
      { id: 'mix_session', name: 'Complete Mix Session', xp: 100 },
      { id: 'master_delivered', name: 'Master Delivered', xp: 150 },
      { id: 'release_ready', name: 'Release Ready', xp: 200 },
    ],
  },
} as const;

// Helper to get journey progress
export async function getJourneyProgress(
  userId: string,
  journeyId: string
): Promise<{ currentStep: string; completedSteps: string[]; progress: number } | null> {
  const { data: journey } = await (supabase
    .from('user_journeys' as any)
    .select('*')
    .eq('user_id', userId)
    .eq('journey_type', journeyId)
    .single() as any);

  if (!journey) return null;

  const journeyDef = Object.values(JOURNEYS).find(j => j.id === journeyId);
  if (!journeyDef) return null;

  const currentStepIndex = journeyDef.steps.findIndex(s => s.id === journey.current_step);
  const completedSteps = journeyDef.steps.slice(0, currentStepIndex).map(s => s.id);
  const progress = Math.round((currentStepIndex / journeyDef.steps.length) * 100);

  return {
    currentStep: journey.current_step,
    completedSteps,
    progress,
  };
}
