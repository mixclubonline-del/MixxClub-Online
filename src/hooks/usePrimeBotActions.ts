import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrimeBot } from '@/contexts/PrimeBotContext';
import { useHubData } from '@/contexts/HubDataContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export function usePrimeBotActions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addAction, updateAction, context } = usePrimeBot();
  const { setCurrentHub, refreshStats, publishEvent } = useHubData();

  // Navigation actions
  const navigateToHub = useCallback(async (hub: string): Promise<ActionResult> => {
    const actionId = addAction({
      type: 'navigate',
      description: `Navigate to ${hub}`,
      status: 'executing',
    });

    try {
      const hubMap: Record<string, string> = {
        dashboard: '',
        clients: 'clients',
        projects: 'projects',
        opportunities: 'opportunities',
        sessions: 'sessions',
        revenue: 'revenue',
        community: 'community',
        growth: 'growth',
      };

      const tab = hubMap[hub.toLowerCase()];
      if (tab !== undefined) {
        setCurrentHub(hub.toLowerCase() as any);
        updateAction(actionId, { status: 'completed', result: { hub } });
        return { success: true, message: `Navigated to ${hub}` };
      }

      updateAction(actionId, { status: 'failed' });
      return { success: false, message: `Unknown hub: ${hub}` };
    } catch (error) {
      updateAction(actionId, { status: 'failed' });
      return { success: false, message: `Navigation failed: ${error}` };
    }
  }, [addAction, updateAction, setCurrentHub]);

  const navigateToRecord = useCallback(async (recordType: string, recordId: string): Promise<ActionResult> => {
    const actionId = addAction({
      type: 'navigate_record',
      description: `View ${recordType} ${recordId}`,
      status: 'executing',
    });

    try {
      // This would open a detail panel or navigate to the record
      updateAction(actionId, { status: 'completed', result: { recordType, recordId } });
      return { success: true, message: `Viewing ${recordType}`, data: { recordType, recordId } };
    } catch (error) {
      updateAction(actionId, { status: 'failed' });
      return { success: false, message: `Failed to view record: ${error}` };
    }
  }, [addAction, updateAction]);

  // Client actions
  const createClient = useCallback(async (name: string, email?: string, phone?: string): Promise<ActionResult> => {
    if (!user?.id) return { success: false, message: 'Not authenticated' };

    const actionId = addAction({
      type: 'create_client',
      description: `Create client: ${name}`,
      status: 'executing',
    });

    try {
      const { data, error } = await supabase
        .from('crm_clients')
        .insert({
          user_id: user.id,
          name,
          email,
          phone,
          client_type: 'prospect',
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      publishEvent('client:created', data);
      updateAction(actionId, { status: 'completed', result: data });
      toast.success(`Client "${name}" created`);
      await refreshStats();
      return { success: true, message: `Client "${name}" created`, data };
    } catch (error) {
      updateAction(actionId, { status: 'failed' });
      return { success: false, message: `Failed to create client: ${error}` };
    }
  }, [user?.id, addAction, updateAction, publishEvent, refreshStats]);

  // Deal actions
  const createDeal = useCallback(async (clientId: string, title: string, value?: number): Promise<ActionResult> => {
    if (!user?.id) return { success: false, message: 'Not authenticated' };

    const actionId = addAction({
      type: 'create_deal',
      description: `Create deal: ${title}`,
      status: 'executing',
    });

    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .insert({
          user_id: user.id,
          client_id: clientId,
          title,
          value,
          stage: 'lead',
        })
        .select()
        .single();

      if (error) throw error;

      publishEvent('deal:created', data);
      updateAction(actionId, { status: 'completed', result: data });
      toast.success(`Deal "${title}" created`);
      await refreshStats();
      return { success: true, message: `Deal "${title}" created`, data };
    } catch (error) {
      updateAction(actionId, { status: 'failed' });
      return { success: false, message: `Failed to create deal: ${error}` };
    }
  }, [user?.id, addAction, updateAction, publishEvent, refreshStats]);

  const updateDealStage = useCallback(async (dealId: string, stage: string): Promise<ActionResult> => {
    const actionId = addAction({
      type: 'update_deal',
      description: `Update deal stage to ${stage}`,
      status: 'executing',
    });

    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .update({ stage, updated_at: new Date().toISOString() })
        .eq('id', dealId)
        .select()
        .single();

      if (error) throw error;

      const eventType = stage === 'won' ? 'deal:won' : stage === 'lost' ? 'deal:lost' : 'deal:updated';
      publishEvent(eventType, data);
      updateAction(actionId, { status: 'completed', result: data });
      toast.success(`Deal moved to ${stage}`);
      await refreshStats();
      return { success: true, message: `Deal updated to ${stage}`, data };
    } catch (error) {
      updateAction(actionId, { status: 'failed' });
      return { success: false, message: `Failed to update deal: ${error}` };
    }
  }, [addAction, updateAction, publishEvent, refreshStats]);

  // Project actions
  const updateProjectStatus = useCallback(async (projectId: string, status: string): Promise<ActionResult> => {
    const actionId = addAction({
      type: 'update_project',
      description: `Update project status to ${status}`,
      status: 'executing',
    });

    try {
      const { data, error } = await supabase
        .from('collaborative_projects')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      const eventType = status === 'completed' ? 'project:completed' : 'project:status_changed';
      publishEvent(eventType, data);
      updateAction(actionId, { status: 'completed', result: data });
      toast.success(`Project status updated to ${status}`);
      await refreshStats();
      return { success: true, message: `Project updated to ${status}`, data };
    } catch (error) {
      updateAction(actionId, { status: 'failed' });
      return { success: false, message: `Failed to update project: ${error}` };
    }
  }, [addAction, updateAction, publishEvent, refreshStats]);

  // Search actions
  const searchAcrossHubs = useCallback(async (query: string): Promise<ActionResult> => {
    if (!user?.id) return { success: false, message: 'Not authenticated' };

    const actionId = addAction({
      type: 'search',
      description: `Search: "${query}"`,
      status: 'executing',
    });

    try {
      const [clientsRes, dealsRes, projectsRes] = await Promise.all([
        supabase
          .from('crm_clients')
          .select('id, name, email')
          .eq('user_id', user.id)
          .ilike('name', `%${query}%`)
          .limit(5),
        supabase
          .from('crm_deals')
          .select('id, title, value')
          .eq('user_id', user.id)
          .ilike('title', `%${query}%`)
          .limit(5),
        supabase
          .from('collaborative_projects')
          .select('id, title, status')
          .ilike('title', `%${query}%`)
          .limit(5),
      ]);

      const results = {
        clients: clientsRes.data || [],
        deals: dealsRes.data || [],
        projects: projectsRes.data || [],
      };

      const totalResults = results.clients.length + results.deals.length + results.projects.length;
      
      updateAction(actionId, { status: 'completed', result: results });
      return { 
        success: true, 
        message: `Found ${totalResults} results for "${query}"`, 
        data: results 
      };
    } catch (error) {
      updateAction(actionId, { status: 'failed' });
      return { success: false, message: `Search failed: ${error}` };
    }
  }, [user?.id, addAction, updateAction]);

  // Message action
  const sendMessage = useCallback(async (recipientId: string, message: string): Promise<ActionResult> => {
    if (!user?.id) return { success: false, message: 'Not authenticated' };

    const actionId = addAction({
      type: 'send_message',
      description: `Send message to user`,
      status: 'executing',
    });

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          message_text: message,
        })
        .select()
        .single();

      if (error) throw error;

      publishEvent('message:sent', data);
      updateAction(actionId, { status: 'completed', result: data });
      toast.success('Message sent');
      return { success: true, message: 'Message sent', data };
    } catch (error) {
      updateAction(actionId, { status: 'failed' });
      return { success: false, message: `Failed to send message: ${error}` };
    }
  }, [user?.id, addAction, updateAction, publishEvent]);

  return {
    // Navigation
    navigateToHub,
    navigateToRecord,
    // Clients
    createClient,
    // Deals
    createDeal,
    updateDealStage,
    // Projects
    updateProjectStatus,
    // Search
    searchAcrossHubs,
    // Messages
    sendMessage,
  };
}
