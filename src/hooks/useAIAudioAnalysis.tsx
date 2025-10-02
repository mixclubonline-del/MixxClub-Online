import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AIAudioProfile {
  id: string;
  user_id: string;
  audio_file_id: string;
  mastering_quality_score: number | null;
  mixing_balance_score: number | null;
  tempo_bpm: number | null;
  key_signature: string | null;
  loudness_lufs: number | null;
  genre_prediction: any;
  mood_analysis: any;
  improvement_suggestions: any[];
  created_at: string;
}

export interface AIMasteringPreset {
  id: string;
  user_id: string;
  preset_name: string;
  genre_optimized: string | null;
  eq_curve: any;
  compression_settings: any;
  limiting_settings: any;
  times_used: number;
  success_rate: number;
  user_rating: number | null;
  model_confidence: number | null;
  is_public: boolean;
  created_at: string;
}

export interface AICollaborationMatch {
  id: string;
  artist_id: string;
  engineer_id: string;
  compatibility_score: number;
  genre_match_score: number | null;
  style_match_score: number | null;
  technical_match_score: number | null;
  shared_characteristics: any[];
  match_status: 'suggested' | 'viewed' | 'contacted' | 'collaborated' | 'dismissed';
  created_at: string;
}

export const useAIAudioProfile = (audioFileId: string) => {
  return useQuery({
    queryKey: ["ai-audio-profile", audioFileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_audio_profiles")
        .select("*")
        .eq("audio_file_id", audioFileId)
        .maybeSingle();

      if (error) throw error;
      return data as AIAudioProfile | null;
    },
    enabled: !!audioFileId,
  });
};

export const useAIMasteringPresets = () => {
  return useQuery({
    queryKey: ["ai-mastering-presets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("ai_mastering_presets")
        .select("*")
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order("times_used", { ascending: false });

      if (error) throw error;
      return data as AIMasteringPreset[];
    },
  });
};

export const useAICollaborationMatches = () => {
  return useQuery({
    queryKey: ["ai-collaboration-matches"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("ai_collaboration_matches")
        .select("*")
        .or(`artist_id.eq.${user.id},engineer_id.eq.${user.id}`)
        .eq("match_status", "suggested")
        .order("compatibility_score", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as AICollaborationMatch[];
    },
  });
};

export const useUpdateMatchStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      status,
      interested,
    }: {
      matchId: string;
      status: AICollaborationMatch['match_status'];
      interested?: boolean;
    }) => {
      const { error } = await supabase
        .from("ai_collaboration_matches")
        .update({ match_status: status })
        .eq("id", matchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-collaboration-matches"] });
      toast.success("Match status updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
};
