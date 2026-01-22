// Journey Events - User progression and gamification
import { supabase } from '@/integrations/supabase/client';

export interface JourneyStep {
  id: string;
  name: string;
  description: string;
  xp: number;
}

export interface Journey {
  id: string;
  name: string;
  description: string;
  steps: JourneyStep[];
}

// User journey definitions
export const JOURNEYS: Record<string, Journey> = {
  fan_journey: {
    id: 'fan_journey',
    name: 'The Supporter Path',
    description: 'Discover your sound and earn your stripes',
    steps: [
      { id: 'first_listen', name: 'First Listen', description: 'Play a track on MixClub', xp: 10 },
      { id: 'first_follow', name: 'Find Your Sound', description: 'Follow your first artist', xp: 25 },
      { id: 'first_vote', name: 'Use Your Voice', description: 'Vote on a premiere', xp: 15 },
      { id: 'first_day1', name: 'Day 1 Status', description: 'Become a Day 1 for an artist', xp: 50 },
      { id: 'tastemaker', name: 'Tastemaker', description: 'Follow 10 artists before they hit 100 followers', xp: 100 },
    ],
  },
  artist_onboarding: {
    id: 'artist_onboarding',
    name: 'Artist Onboarding',
    description: 'Get started as an artist on MixClub',
    steps: [
      { id: 'welcome', name: 'Welcome', description: 'Complete your welcome', xp: 10 },
      { id: 'profile', name: 'Complete Profile', description: 'Fill out your artist profile', xp: 25 },
      { id: 'first_upload', name: 'First Upload', description: 'Upload your first track', xp: 50 },
      { id: 'first_session', name: 'Book Session', description: 'Book your first mixing session', xp: 100 },
    ],
  },
  engineer_onboarding: {
    id: 'engineer_onboarding',
    name: 'Engineer Onboarding',
    description: 'Get started as an engineer on MixClub',
    steps: [
      { id: 'welcome', name: 'Welcome', description: 'Complete your welcome', xp: 10 },
      { id: 'profile', name: 'Complete Profile', description: 'Set up your engineer profile', xp: 25 },
      { id: 'portfolio', name: 'Add Portfolio', description: 'Upload portfolio samples', xp: 50 },
      { id: 'first_client', name: 'First Client', description: 'Complete your first client project', xp: 100 },
    ],
  },
  community_explorer: {
    id: 'community_explorer',
    name: 'Community Explorer',
    description: 'Engage with the MixClub community',
    steps: [
      { id: 'join_feed', name: 'Join Feed', description: 'Post in the community feed', xp: 15 },
      { id: 'first_comment', name: 'First Comment', description: 'Comment on a post', xp: 10 },
      { id: 'follow_creators', name: 'Follow Creators', description: 'Follow 5 creators', xp: 20 },
    ],
  },
};

// Start a new journey for a user
export const startJourney = async (
  userId: string,
  journeyType: string,
  firstStepId: string
): Promise<void> => {
  const { error } = await supabase
    .from('user_journeys')
    .insert({
      user_id: userId,
      journey_type: journeyType,
      current_step: firstStepId,
      started_at: new Date().toISOString(),
      metadata: {},
    });

  if (error) {
    console.error('Error starting journey:', error);
    throw error;
  }
};

// Complete a journey step
export const completeJourneyStep = async (
  userId: string,
  journeyType: string,
  stepId: string,
  metadata?: { nextStep?: string }
): Promise<void> => {
  const journey = JOURNEYS[journeyType];
  if (!journey) return;

  const currentStepIndex = journey.steps.findIndex(s => s.id === stepId);
  const isLastStep = currentStepIndex === journey.steps.length - 1;
  const nextStep = metadata?.nextStep || journey.steps[currentStepIndex + 1]?.id;

  const updateData: Record<string, unknown> = {
    current_step: isLastStep ? stepId : nextStep,
    metadata: { lastCompletedStep: stepId },
  };

  if (isLastStep) {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('user_journeys')
    .update(updateData)
    .eq('user_id', userId)
    .eq('journey_type', journeyType);

  if (error) {
    console.error('Error completing journey step:', error);
    throw error;
  }
};
