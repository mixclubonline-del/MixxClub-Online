import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useCRMOffline } from '@/hooks/useCRMOffline';
import type { Json } from '@/integrations/supabase/types';

export interface CRMClient {
  id: string;
  user_id: string;
  client_user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  client_type: 'artist' | 'engineer' | 'label' | 'manager' | 'other';
  source: 'platform' | 'referral' | 'website' | 'social' | 'other';
  status: 'active' | 'inactive' | 'lead';
  avatar_url: string | null;
  notes_count: number;
  deals_count: number;
  total_value: number;
  last_interaction_at: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  tags?: CRMTag[];
}

export interface CRMTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  client_type?: CRMClient['client_type'];
  source?: CRMClient['source'];
  status?: CRMClient['status'];
  avatar_url?: string;
  client_user_id?: string;
  metadata?: Json;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  id: string;
}

export function useCRMClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [tags, setTags] = useState<CRMTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline, queueAction, cacheData, getCachedData } = useCRMOffline();

  const fetchClients = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);

      if (!isOnline) {
        const cached = getCachedData<CRMClient[]>(`crm_clients_${user.id}`);
        if (cached) {
          setClients(cached);
          setLoading(false);
          return;
        }
      }

      const { data, error: fetchError } = await supabase
        .from('crm_clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      const result = (data as CRMClient[]) || [];
      setClients(result);
      cacheData(`crm_clients_${user.id}`, result);
    } catch (err) {
      console.error('Error fetching clients:', err);
      // Fallback to cache on network error
      const cached = getCachedData<CRMClient[]>(`crm_clients_${user.id}`);
      if (cached) {
        setClients(cached);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, isOnline, cacheData, getCachedData]);

  const fetchTags = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('crm_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (fetchError) throw fetchError;
      setTags((data as CRMTag[]) || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  }, [user?.id]);

  const createClient = useCallback(async (input: CreateClientInput): Promise<CRMClient | null> => {
    if (!user?.id) return null;

    const payload = {
      user_id: user.id,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      company: input.company || null,
      client_type: input.client_type || 'other',
      source: input.source || 'platform',
      status: input.status || 'active',
      avatar_url: input.avatar_url || null,
      client_user_id: input.client_user_id || null,
      metadata: input.metadata || {},
    };

    if (!isOnline) {
      queueAction('insert', 'crm_clients', payload);
      toast.info('Client saved offline — will sync when back online');
      return null;
    }

    try {
      const { data, error: createError } = await supabase
        .from('crm_clients')
        .insert(payload)
        .select()
        .single();

      if (createError) throw createError;
      
      const newClient = data as CRMClient;
      setClients(prev => [newClient, ...prev]);
      toast.success('Client added successfully');
      return newClient;
    } catch (err) {
      console.error('Error creating client:', err);
      toast.error('Failed to create client');
      return null;
    }
  }, [user?.id, isOnline, queueAction]);

  const updateClient = useCallback(async (input: UpdateClientInput): Promise<CRMClient | null> => {
    if (!user?.id) return null;

    const { id, ...updates } = input;

    if (!isOnline) {
      queueAction('update', 'crm_clients', { id, ...updates, updated_at: new Date().toISOString() });
      toast.info('Update saved offline — will sync when back online');
      return null;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('crm_clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      const updatedClient = data as CRMClient;
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      toast.success('Client updated');
      return updatedClient;
    } catch (err) {
      console.error('Error updating client:', err);
      toast.error('Failed to update client');
      return null;
    }
  }, [user?.id, isOnline, queueAction]);

  const deleteClient = useCallback(async (clientId: string): Promise<boolean> => {
    if (!user?.id) return false;

    if (!isOnline) {
      queueAction('delete', 'crm_clients', { id: clientId });
      setClients(prev => prev.filter(c => c.id !== clientId));
      toast.info('Delete saved offline — will sync when back online');
      return true;
    }

    try {
      const { error: deleteError } = await supabase
        .from('crm_clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      setClients(prev => prev.filter(c => c.id !== clientId));
      toast.success('Client deleted');
      return true;
    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error('Failed to delete client');
      return false;
    }
  }, [user?.id, isOnline, queueAction]);

  const createTag = useCallback(async (name: string, color: string = '#6366f1'): Promise<CRMTag | null> => {
    if (!user?.id) return null;

    try {
      const { data, error: createError } = await supabase
        .from('crm_tags')
        .insert({ user_id: user.id, name, color })
        .select()
        .single();

      if (createError) throw createError;
      
      const newTag = data as CRMTag;
      setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      return newTag;
    } catch (err) {
      console.error('Error creating tag:', err);
      toast.error('Failed to create tag');
      return null;
    }
  }, [user?.id]);

  const addTagToClient = useCallback(async (clientId: string, tagId: string): Promise<boolean> => {
    try {
      const { error: insertError } = await supabase
        .from('crm_client_tags')
        .insert({ client_id: clientId, tag_id: tagId });

      if (insertError) throw insertError;
      return true;
    } catch (err) {
      console.error('Error adding tag to client:', err);
      return false;
    }
  }, []);

  const removeTagFromClient = useCallback(async (clientId: string, tagId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('crm_client_tags')
        .delete()
        .eq('client_id', clientId)
        .eq('tag_id', tagId);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error removing tag from client:', err);
      return false;
    }
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    fetchClients();
    fetchTags();

    const channel = supabase
      .channel('crm_clients_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_clients',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClients(prev => [payload.new as CRMClient, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setClients(prev => prev.map(c => c.id === payload.new.id ? payload.new as CRMClient : c));
          } else if (payload.eventType === 'DELETE') {
            setClients(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchClients, fetchTags]);

  return {
    clients,
    tags,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    createTag,
    addTagToClient,
    removeTagFromClient,
    refetch: fetchClients,
  };
}
