import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export type InteractionType = 'message' | 'session' | 'project' | 'payment' | 'call' | 'meeting' | 'email' | 'note' | 'deal_update';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface CRMInteraction {
  id: string;
  user_id: string;
  client_id: string;
  interaction_type: InteractionType;
  reference_id: string | null;
  summary: string;
  sentiment: Sentiment | null;
  metadata: Json;
  occurred_at: string;
  created_at: string;
  client?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export interface CRMNote {
  id: string;
  user_id: string;
  client_id: string;
  deal_id: string | null;
  note_type: 'general' | 'call' | 'meeting' | 'email' | 'task' | 'follow_up';
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInteractionInput {
  client_id: string;
  interaction_type: InteractionType;
  summary: string;
  sentiment?: Sentiment;
  reference_id?: string;
  occurred_at?: string;
  metadata?: Json;
}

export interface CreateNoteInput {
  client_id: string;
  content: string;
  note_type?: CRMNote['note_type'];
  deal_id?: string;
  is_pinned?: boolean;
}

export interface UpdateNoteInput extends Partial<CreateNoteInput> {
  id: string;
}

export function useCRMInteractions(clientId?: string) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<CRMInteraction[]>([]);
  const [notes, setNotes] = useState<CRMNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInteractions = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('crm_interactions')
        .select(`
          *,
          client:crm_clients(id, name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('occurred_at', { ascending: false })
        .limit(100);

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setInteractions((data as CRMInteraction[]) || []);
    } catch (err) {
      console.error('Error fetching interactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch interactions');
    } finally {
      setLoading(false);
    }
  }, [user?.id, clientId]);

  const fetchNotes = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      let query = supabase
        .from('crm_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setNotes((data as CRMNote[]) || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  }, [user?.id, clientId]);

  const logInteraction = useCallback(async (input: CreateInteractionInput): Promise<CRMInteraction | null> => {
    if (!user?.id) return null;

    try {
      const { data, error: createError } = await supabase
        .from('crm_interactions')
        .insert({
          user_id: user.id,
          client_id: input.client_id,
          interaction_type: input.interaction_type,
          summary: input.summary,
          sentiment: input.sentiment || null,
          reference_id: input.reference_id || null,
          occurred_at: input.occurred_at || new Date().toISOString(),
          metadata: input.metadata || {},
        })
        .select(`
          *,
          client:crm_clients(id, name, avatar_url)
        `)
        .single();

      if (createError) throw createError;
      
      const newInteraction = data as CRMInteraction;
      setInteractions(prev => [newInteraction, ...prev]);
      return newInteraction;
    } catch (err) {
      console.error('Error logging interaction:', err);
      toast.error('Failed to log interaction');
      return null;
    }
  }, [user?.id]);

  const createNote = useCallback(async (input: CreateNoteInput): Promise<CRMNote | null> => {
    if (!user?.id) return null;

    try {
      const { data, error: createError } = await supabase
        .from('crm_notes')
        .insert({
          user_id: user.id,
          client_id: input.client_id,
          content: input.content,
          note_type: input.note_type || 'general',
          deal_id: input.deal_id || null,
          is_pinned: input.is_pinned || false,
        })
        .select()
        .single();

      if (createError) throw createError;
      
      const newNote = data as CRMNote;
      setNotes(prev => [newNote, ...prev]);

      // Also log as interaction
      await logInteraction({
        client_id: input.client_id,
        interaction_type: 'note',
        summary: `Added ${input.note_type || 'general'} note`,
        metadata: { note_id: newNote.id },
      });

      toast.success('Note added');
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      toast.error('Failed to create note');
      return null;
    }
  }, [user?.id, logInteraction]);

  const updateNote = useCallback(async (input: UpdateNoteInput): Promise<CRMNote | null> => {
    if (!user?.id) return null;

    try {
      const { id, ...updates } = input;
      const { data, error: updateError } = await supabase
        .from('crm_notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      const updatedNote = data as CRMNote;
      setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
      toast.success('Note updated');
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      toast.error('Failed to update note');
      return null;
    }
  }, [user?.id]);

  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error: deleteError } = await supabase
        .from('crm_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast.success('Note deleted');
      return true;
    } catch (err) {
      console.error('Error deleting note:', err);
      toast.error('Failed to delete note');
      return false;
    }
  }, [user?.id]);

  const toggleNotePinned = useCallback(async (noteId: string): Promise<boolean> => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return false;

    const result = await updateNote({ id: noteId, is_pinned: !note.is_pinned });
    return result !== null;
  }, [notes, updateNote]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    fetchInteractions();
    fetchNotes();

    const interactionsChannel = supabase
      .channel('crm_interactions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crm_interactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchInteractions();
        }
      )
      .subscribe();

    const notesChannel = supabase
      .channel('crm_notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crm_notes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes(prev => [payload.new as CRMNote, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotes(prev => prev.map(n => n.id === payload.new.id ? payload.new as CRMNote : n));
          } else if (payload.eventType === 'DELETE') {
            setNotes(prev => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(interactionsChannel);
      supabase.removeChannel(notesChannel);
    };
  }, [user?.id, fetchInteractions, fetchNotes]);

  return {
    interactions,
    notes,
    loading,
    error,
    logInteraction,
    createNote,
    updateNote,
    deleteNote,
    toggleNotePinned,
    refetch: () => {
      fetchInteractions();
      fetchNotes();
    },
  };
}
