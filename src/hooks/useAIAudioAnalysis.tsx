import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AIAudioProfile {
  id: string;
  user_id: string;
  audio_file_id: string;
  analysis_version: string;
  
  // Spectral Analysis
  frequency_distribution: any;
  harmonic_content: any;
  spectral_centroid: number | null;
  spectral_rolloff: number | null;
  
  // Dynamic Analysis
  dynamic_range: number | null;
  loudness_lufs: number | null;
  peak_level: number | null;
  rms_level: number | null;
  
  // Temporal Analysis
  tempo_bpm: number | null;
  time_signature: string | null;
  beat_grid: any[];
  
  // Tonal Analysis
  key_signature: string | null;
  scale_type: string | null;
  chord_progression: any[];
  
  // Spatial Analysis
  stereo_width: number | null;
  phase_correlation: number | null;
  
  // Production Quality Metrics
  mastering_quality_score: number | null;
  mixing_balance_score: number | null;
  frequency_balance: any;
  problem_frequencies: any[];
  
  // AI-Generated Insights
  genre_prediction: any;
  mood_analysis: any;
  style_references: any[];
  improvement_suggestions: any[];
  
  // Processing Info
  processing_time_ms: number | null;
  ai_model_version: string | null;
  confidence_scores: any;
  
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
  match_factors: any;
  shared_characteristics: any[];
  complementary_skills: any[];
  match_status: 'suggested' | 'viewed' | 'contacted' | 'collaborated' | 'dismissed';
  created_at: string;
}

export const useAIAudioProfiles = (audioFileId?: string) => {
  return useQuery({
    queryKey: ["ai-audio-profiles", audioFileId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("ai_audio_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (audioFileId) {
        query = query.eq("audio_file_id", audioFileId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AIAudioProfile[];
    },
  });
};

export const useAIMasteringPresets = (includePublic: boolean = false) => {
  return useQuery({
    queryKey: ["ai-mastering-presets", includePublic],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("ai_mastering_presets")
        .select("*")
        .order("times_used", { ascending: false });

      if (includePublic) {
        query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
      } else {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

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
        .neq("match_status", "dismissed")
        .order("compatibility_score", { ascending: false });

      if (error) throw error;
      return data as AICollaborationMatch[];
    },
  });
};
