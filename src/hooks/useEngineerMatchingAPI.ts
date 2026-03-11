/**
 * Hook for live backend engineer matching via match-engineers Edge Function
 * Replaces static demo data with real API calls
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUsageEnforcement } from '@/hooks/useUsageEnforcement';

export interface MatchCriteria {
  budgetRange: string;  // 'under-50' | '50-100' | '100-300' | '300-500' | '500+'
  genres: string[];
  projectType: string;  // 'mixing' | 'mastering' | 'production' | 'full-service'
}

export interface EngineerMatch {
  engineerId: string;
  engineerName: string;
  avatarUrl?: string;
  specialties: string[];
  genres: string[];
  experience: number;
  rating: number;
  completedProjects: number;
  hourlyRate: number;
  matchScore: number;
  matchingGenres: string[];
  portfolioUrl?: string;
}

interface HireResult {
  partnershipId: string;
  projectId: string;
}

export function useEngineerMatchingAPI() {
  const [matches, setMatches] = useState<EngineerMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hiring, setHiring] = useState(false);
  const { canUseFeature, getFeatureUsage, refreshUsage, tier } = useUsageEnforcement();

  const matchingUsage = getFeatureUsage('ai_matching');

  /**
   * Find matching engineers based on project criteria
   */
  const findMatches = useCallback(async (criteria: MatchCriteria): Promise<EngineerMatch[]> => {
    if (!canUseFeature('ai_matching')) {
      const usage = getFeatureUsage('ai_matching');
      toast.error(`AI matching limit reached (${usage.current}/${usage.limit}) on your ${tier} plan. Upgrade for more.`, {
        action: { label: 'Upgrade', onClick: () => window.location.href = '/pricing?feature=ai_matching' },
      });
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('match-engineers', {
        body: {
          budgetRange: criteria.budgetRange,
          genres: criteria.genres,
          projectType: criteria.projectType,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to find matches');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const matchResults: EngineerMatch[] = data?.matches || [];
      setMatches(matchResults);
      await refreshUsage();
      return matchResults;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find matching engineers';
      setError(message);
      console.error('[useEngineerMatchingAPI] Error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [canUseFeature, getFeatureUsage, tier, refreshUsage]);

  /**
   * Hire an engineer - creates partnership and project records
   */
  const hireEngineer = useCallback(async (
    engineerId: string,
    projectDetails: {
      title: string;
      description?: string;
      projectType: string;
    }
  ): Promise<HireResult | null> => {
    setHiring(true);

    // Check collaborations limit before creating new partnership
    if (!canUseFeature('collaborations')) {
      const usage = getFeatureUsage('collaborations');
      toast.error(`Collaboration limit reached (${usage.current}/${usage.limit}) on your ${tier} plan. Upgrade for more.`, {
        action: { label: 'Upgrade', onClick: () => window.location.href = '/pricing?feature=collaborations' },
      });
      setHiring(false);
      return null;
    }

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to hire an engineer');
      }

      // Check if partnership already exists
      const { data: existingPartnership } = await supabase
        .from('partnerships')
        .select('id')
        .eq('artist_id', user.id)
        .eq('producer_id', engineerId)
        .maybeSingle();

      let partnershipId: string;

      if (existingPartnership) {
        partnershipId = existingPartnership.id;
      } else {
        // Create new partnership
        const { data: newPartnership, error: partnershipError } = await supabase
          .from('partnerships')
          .insert({
            artist_id: user.id,
            producer_id: engineerId,
            status: 'active',
            partnership_type: 'project',
          })
          .select('id')
          .single();

        if (partnershipError) {
          throw new Error('Failed to create partnership');
        }
        partnershipId = newPartnership.id;
      }

      // Create collaborative project
      const { data: newProject, error: projectError } = await supabase
        .from('collaborative_projects')
        .insert({
          partnership_id: partnershipId,
          title: projectDetails.title,
          description: projectDetails.description || null,
          project_type: projectDetails.projectType,
          status: 'planning',
          progress_percentage: 0,
        })
        .select('id')
        .single();

      if (projectError) {
        throw new Error('Failed to create project');
      }

      // Create notification for engineer
      await supabase.from('notifications').insert({
        user_id: engineerId,
        type: 'project_invitation',
        title: 'New Project Invitation',
        message: `You've been hired for a new ${projectDetails.projectType} project: "${projectDetails.title}"`,
        action_url: `/projects/${newProject.id}`,
        metadata: {
          project_id: newProject.id,
          partnership_id: partnershipId,
          artist_id: user.id,
        },
      });

      toast.success('Engineer hired successfully!');

      return {
        partnershipId,
        projectId: newProject.id,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to hire engineer';
      toast.error(message);
      console.error('[useEngineerMatchingAPI] Hire error:', err);
      return null;
    } finally {
      setHiring(false);
    }
  }, []);

  /**
   * Clear current matches
   */
  const clearMatches = useCallback(() => {
    setMatches([]);
    setError(null);
  }, []);

  return {
    matches,
    loading,
    error,
    hiring,
    findMatches,
    hireEngineer,
    clearMatches,
    matchingUsage,
  };
}
