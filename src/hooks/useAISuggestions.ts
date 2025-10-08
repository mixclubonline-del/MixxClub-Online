import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AISuggestion {
  id: string;
  suggestion_type: string;
  suggestion_title: string;
  suggestion_description: string;
  confidence_score: number;
  parameters: any;
  applied: boolean;
}

export const useAISuggestions = (sessionId: string | null) => {
  const queryClient = useQueryClient();

  const { data: aiAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['ai-analysis', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const { data, error } = await supabase
        .from('mixxmaster_ai_metadata')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['ai-suggestions', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('ai_mixing_suggestions')
        .select('*')
        .eq('session_id', sessionId)
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      return data as AISuggestion[];
    },
    enabled: !!sessionId,
  });

  const applySuggestion = useMutation({
    mutationFn: async ({ suggestionId }: { suggestionId: string }) => {
      const { error } = await supabase
        .from('ai_mixing_suggestions')
        .update({ 
          applied: true, 
          applied_at: new Date().toISOString(),
          applied_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq('id', suggestionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-suggestions', sessionId] });
      toast.success('AI suggestion applied');
    },
    onError: () => {
      toast.error('Failed to apply suggestion');
    },
  });

  return {
    aiAnalysis,
    suggestions,
    isLoading: analysisLoading || suggestionsLoading,
    applySuggestion: applySuggestion.mutate,
  };
};
