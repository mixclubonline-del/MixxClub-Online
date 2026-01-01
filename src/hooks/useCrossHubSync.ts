import { useEffect, useCallback } from 'react';
import { useHubEvent, hubEventBus, HubEvent } from '@/lib/hubEventBus';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Cross-Hub Sync Hook
 * Automatically syncs data across hubs when relevant events occur
 */
export function useCrossHubSync() {
  const { user } = useAuth();

  // When a deal is won, auto-create a project
  const handleDealWon = useCallback(async (event: HubEvent<{ id: string; client_id: string; title: string; value?: number }>) => {
    if (!user?.id) return;
    
    const deal = event.payload;
    
    try {
      // Check if a project already exists for this deal
      const { data: existingProject } = await supabase
        .from('crm_deals')
        .select('project_id')
        .eq('id', deal.id)
        .single();

      if (existingProject?.project_id) return; // Already has a project

      // Create a new project linked to this deal
      // First, we need a partnership - for now just log the action
      console.log(`[CrossHubSync] Deal "${deal.title}" won - consider creating a project`);
      
      // Log activity
      toast.success(`Deal "${deal.title}" won! Consider creating a project.`);
    } catch (error) {
      console.error('[CrossHubSync] Error handling deal won:', error);
    }
  }, [user?.id]);

  // When a project completes, update client stats
  const handleProjectCompleted = useCallback(async (event: HubEvent<{ id: string; partnership_id: string; total_revenue?: number }>) => {
    if (!user?.id) return;

    const project = event.payload;
    
    try {
      // Get the client linked to this project
      const { data: projectData } = await supabase
        .from('collaborative_projects')
        .select('client_id, title')
        .eq('id', project.id)
        .single();

      if (projectData?.client_id) {
        // Log an interaction for the client
        await supabase.from('crm_interactions').insert({
          user_id: user.id,
          client_id: projectData.client_id,
          interaction_type: 'project_completed',
          summary: `Project "${projectData.title}" completed`,
          sentiment: 'positive',
          metadata: { project_id: project.id, revenue: project.total_revenue },
        });

        console.log(`[CrossHubSync] Project completed - client interaction logged`);
      }
    } catch (error) {
      console.error('[CrossHubSync] Error handling project completed:', error);
    }
  }, [user?.id]);

  // When a milestone is paid, update revenue tracking
  const handleMilestonePayment = useCallback(async (event: HubEvent<{ milestone_id: string; amount: number; project_id: string }>) => {
    if (!user?.id) return;

    const { milestone_id, amount, project_id } = event.payload;
    
    try {
      // Update project total revenue
      const { data: project } = await supabase
        .from('collaborative_projects')
        .select('total_revenue')
        .eq('id', project_id)
        .single();

      if (project) {
        await supabase
          .from('collaborative_projects')
          .update({ 
            total_revenue: (project.total_revenue || 0) + amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', project_id);

        console.log(`[CrossHubSync] Milestone paid - project revenue updated`);
      }
    } catch (error) {
      console.error('[CrossHubSync] Error handling milestone payment:', error);
    }
  }, [user?.id]);

  // When a match is contacted, create a client record
  const handleMatchContacted = useCallback(async (event: HubEvent<{ match_id: string; user_name: string; user_email?: string }>) => {
    if (!user?.id) return;

    const { user_name, user_email } = event.payload;
    
    try {
      // Check if client already exists
      const { data: existingClient } = await supabase
        .from('crm_clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', user_name)
        .maybeSingle();

      if (!existingClient) {
        // Create new client from match
        const { data: newClient, error } = await supabase
          .from('crm_clients')
          .insert({
            user_id: user.id,
            name: user_name,
            email: user_email,
            client_type: 'prospect',
            status: 'active',
            source: 'ai_match',
          })
          .select()
          .single();

        if (!error && newClient) {
          hubEventBus.publish('client:created', newClient, 'cross_hub_sync');
          toast.success(`Client "${user_name}" added from match`);
        }
      }
    } catch (error) {
      console.error('[CrossHubSync] Error handling match contacted:', error);
    }
  }, [user?.id]);

  // When a message is sent, log as client interaction
  const handleMessageSent = useCallback(async (event: HubEvent<{ recipient_id: string; message_text: string }>) => {
    if (!user?.id) return;

    const { recipient_id, message_text } = event.payload;
    
    try {
      // Find if recipient is a linked client
      const { data: client } = await supabase
        .from('crm_clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('client_user_id', recipient_id)
        .maybeSingle();

      if (client) {
        await supabase.from('crm_interactions').insert({
          user_id: user.id,
          client_id: client.id,
          interaction_type: 'message',
          summary: message_text.substring(0, 200),
          metadata: { full_message: message_text },
        });
      }
    } catch (error) {
      console.error('[CrossHubSync] Error logging message interaction:', error);
    }
  }, [user?.id]);

  // Subscribe to events
  useHubEvent('deal:won', handleDealWon);
  useHubEvent('project:completed', handleProjectCompleted);
  useHubEvent('milestone:payment_received', handleMilestonePayment);
  useHubEvent('match:contacted', handleMatchContacted);
  useHubEvent('message:sent', handleMessageSent);

  return {
    // Expose methods for manual triggering if needed
    syncDealToProject: handleDealWon,
    syncProjectToClient: handleProjectCompleted,
  };
}
