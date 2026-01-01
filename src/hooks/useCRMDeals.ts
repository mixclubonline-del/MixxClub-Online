import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export type DealStage = 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface CRMDeal {
  id: string;
  user_id: string;
  client_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expected_close_date: string | null;
  closed_at: string | null;
  won_at: string | null;
  lost_reason: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface CreateDealInput {
  client_id: string;
  title: string;
  description?: string;
  value?: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  expected_close_date?: string;
  project_id?: string;
  metadata?: Json;
}

export interface UpdateDealInput extends Partial<CreateDealInput> {
  id: string;
  lost_reason?: string;
}

export const DEAL_STAGES: { value: DealStage; label: string; probability: number; color: string }[] = [
  { value: 'lead', label: 'Lead', probability: 10, color: 'bg-slate-500' },
  { value: 'contacted', label: 'Contacted', probability: 25, color: 'bg-blue-500' },
  { value: 'proposal', label: 'Proposal', probability: 50, color: 'bg-yellow-500' },
  { value: 'negotiation', label: 'Negotiation', probability: 75, color: 'bg-orange-500' },
  { value: 'won', label: 'Won', probability: 100, color: 'bg-green-500' },
  { value: 'lost', label: 'Lost', probability: 0, color: 'bg-red-500' },
];

export function useCRMDeals(clientId?: string) {
  const { user } = useAuth();
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('crm_deals')
        .select(`
          *,
          client:crm_clients(id, name, email, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setDeals((data as CRMDeal[]) || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  }, [user?.id, clientId]);

  const createDeal = useCallback(async (input: CreateDealInput): Promise<CRMDeal | null> => {
    if (!user?.id) return null;

    try {
      const stageInfo = DEAL_STAGES.find(s => s.value === (input.stage || 'lead'));
      const { data, error: createError } = await supabase
        .from('crm_deals')
        .insert({
          user_id: user.id,
          client_id: input.client_id,
          title: input.title,
          description: input.description || null,
          value: input.value || 0,
          currency: input.currency || 'USD',
          stage: input.stage || 'lead',
          probability: input.probability ?? stageInfo?.probability ?? 10,
          expected_close_date: input.expected_close_date || null,
          project_id: input.project_id || null,
          metadata: input.metadata || {},
        })
        .select(`
          *,
          client:crm_clients(id, name, email, avatar_url)
        `)
        .single();

      if (createError) throw createError;
      
      const newDeal = data as CRMDeal;
      setDeals(prev => [newDeal, ...prev]);
      toast.success('Deal created successfully');
      return newDeal;
    } catch (err) {
      console.error('Error creating deal:', err);
      toast.error('Failed to create deal');
      return null;
    }
  }, [user?.id]);

  const updateDeal = useCallback(async (input: UpdateDealInput): Promise<CRMDeal | null> => {
    if (!user?.id) return null;

    try {
      const { id, ...updates } = input;
      
      // If stage is changing to won/lost, set the appropriate timestamp
      const additionalUpdates: Record<string, unknown> = {};
      if (updates.stage === 'won') {
        additionalUpdates.won_at = new Date().toISOString();
        additionalUpdates.closed_at = new Date().toISOString();
        additionalUpdates.probability = 100;
      } else if (updates.stage === 'lost') {
        additionalUpdates.closed_at = new Date().toISOString();
        additionalUpdates.probability = 0;
      }

      const { data, error: updateError } = await supabase
        .from('crm_deals')
        .update({ 
          ...updates, 
          ...additionalUpdates,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          client:crm_clients(id, name, email, avatar_url)
        `)
        .single();

      if (updateError) throw updateError;
      
      const updatedDeal = data as CRMDeal;
      setDeals(prev => prev.map(d => d.id === id ? updatedDeal : d));
      toast.success('Deal updated');
      return updatedDeal;
    } catch (err) {
      console.error('Error updating deal:', err);
      toast.error('Failed to update deal');
      return null;
    }
  }, [user?.id]);

  const updateDealStage = useCallback(async (dealId: string, newStage: DealStage): Promise<boolean> => {
    const stageInfo = DEAL_STAGES.find(s => s.value === newStage);
    const result = await updateDeal({
      id: dealId,
      stage: newStage,
      probability: stageInfo?.probability,
    });
    return result !== null;
  }, [updateDeal]);

  const deleteDeal = useCallback(async (dealId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error: deleteError } = await supabase
        .from('crm_deals')
        .delete()
        .eq('id', dealId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      setDeals(prev => prev.filter(d => d.id !== dealId));
      toast.success('Deal deleted');
      return true;
    } catch (err) {
      console.error('Error deleting deal:', err);
      toast.error('Failed to delete deal');
      return false;
    }
  }, [user?.id]);

  // Pipeline analytics
  const getPipelineStats = useCallback(() => {
    const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
    const wonDeals = deals.filter(d => d.stage === 'won');
    const lostDeals = deals.filter(d => d.stage === 'lost');

    const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
    const weightedPipelineValue = activeDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);
    const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
    const conversionRate = deals.length > 0 ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0;

    const byStage = DEAL_STAGES.map(stage => ({
      ...stage,
      count: deals.filter(d => d.stage === stage.value).length,
      value: deals.filter(d => d.stage === stage.value).reduce((sum, d) => sum + d.value, 0),
    }));

    return {
      totalDeals: deals.length,
      activeDeals: activeDeals.length,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      totalPipelineValue,
      weightedPipelineValue,
      wonValue,
      conversionRate: isNaN(conversionRate) ? 0 : conversionRate,
      byStage,
    };
  }, [deals]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    fetchDeals();

    const channel = supabase
      .channel('crm_deals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_deals',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch to get the joined client data
          fetchDeals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchDeals]);

  return {
    deals,
    loading,
    error,
    createDeal,
    updateDeal,
    updateDealStage,
    deleteDeal,
    getPipelineStats,
    refetch: fetchDeals,
    DEAL_STAGES,
  };
}
