import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { hubEventBus } from '@/lib/hubEventBus';
import { toast } from 'sonner';

/**
 * usePartnershipNotifications
 * 
 * Subscribes to Supabase Realtime on partnership-related tables and
 * publishes events to the hubEventBus + fires sonner toasts for
 * immediate user feedback. DB triggers handle notification row creation.
 */
export function usePartnershipNotifications(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    // Listen for collaborative project status changes (milestones)
    const projectsChannel = supabase
      .channel('partnership-projects')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'collaborative_projects',
        },
        (payload) => {
          const project = payload.new as Record<string, unknown>;
          const oldProject = payload.old as Record<string, unknown>;

          if (
            project.status !== oldProject.status &&
            (project.status === 'completed' || project.status === 'released')
          ) {
            hubEventBus.publish('milestone:completed', {
              id: project.id,
              partnership_id: project.partnership_id,
              title: project.title,
              status: project.status,
            }, 'partnership_notifications');

            toast.success(`🎯 Project "${project.title}" is now ${project.status}!`, {
              action: {
                label: 'View',
                onClick: () => window.location.assign('/artist-crm?tab=earnings'),
              },
            });
          }
        }
      )
      .subscribe();

    // Listen for revenue split completions
    const revenueChannel = supabase
      .channel('partnership-revenue')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'revenue_splits',
        },
        (payload) => {
          const split = payload.new as Record<string, unknown>;
          const oldSplit = payload.old as Record<string, unknown>;

          if (split.status === 'completed' && oldSplit.status !== 'completed') {
            const amount = Number(split.total_amount) || 0;

            hubEventBus.publish('revenue:received', {
              split_id: split.id,
              partnership_id: split.partnership_id,
              total_amount: amount,
              artist_amount: split.artist_amount,
              engineer_amount: split.engineer_amount,
            }, 'partnership_notifications');

            toast.success(
              `💰 Revenue split of $${amount.toFixed(2)} completed!`,
              {
                action: {
                  label: 'View',
                  onClick: () => window.location.assign('/artist-crm?tab=earnings'),
                },
              }
            );
          }
        }
      )
      .subscribe();

    // Listen for partnership health warnings
    const healthChannel = supabase
      .channel('partnership-health')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'partnership_health',
        },
        (payload) => {
          const health = payload.new as Record<string, unknown>;
          const oldHealth = payload.old as Record<string, unknown>;
          const score = Number(health.health_score) || 0;
          const oldScore = Number(oldHealth.health_score) || 100;

          if (score < 60 && oldScore >= 60) {
            const isCritical = score < 30;

            hubEventBus.publish('activity:logged', {
              type: isCritical ? 'health_critical' : 'health_warning',
              partnership_id: health.partnership_id,
              health_score: score,
            }, 'partnership_notifications');

            if (isCritical) {
              toast.error(`⚠️ Partnership health critical: ${score}/100`, {
                description: 'Review activity and pending payments immediately.',
              });
            } else {
              toast.warning(`⚠️ Partnership health warning: ${score}/100`, {
                description: 'Consider reaching out to your partner.',
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(revenueChannel);
      supabase.removeChannel(healthChannel);
    };
  }, [userId]);
}
