import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DemoBeat {
  id: string;
  title: string;
  description: string | null;
  genre: string;
  mood: string;
  bpm: number | null;
  intensity: number | null;
  audio_url: string | null;
  storage_path: string | null;
  duration_seconds: number | null;
  tags: string[];
  is_featured: boolean;
  play_count: number;
  download_count: number;
  ai_prompt: string | null;
  generation_model: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface GenerateBeatParams {
  prompt: string;
  genre: string;
  mood: string;
  intensity?: number;
  title?: string;
  tags?: string[];
}

export function useDemoBeats() {
  const [beats, setBeats] = useState<DemoBeat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBeats = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('demo_beats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBeats((data as DemoBeat[]) || []);
    } catch (err: any) {
      console.error('Error fetching demo beats:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBeat = async (params: GenerateBeatParams): Promise<DemoBeat | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Use trap beat generator for intensity-based generation
      const intensity = params.intensity || 3;
      
      toast.info(`Prime is generating a ${params.genre} beat...`);
      
      const { data, error: fnError } = await supabase.functions.invoke('generate-trap-beat', {
        body: { intensity }
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (!data?.audioUrl) throw new Error('No audio URL returned from generation');

      // Save to database
      const beatTitle = params.title || `${params.genre.charAt(0).toUpperCase() + params.genre.slice(1)} Beat - ${params.mood}`;
      
      const { data: savedBeat, error: saveError } = await supabase
        .from('demo_beats')
        .insert({
          title: beatTitle,
          description: `AI-generated ${params.genre} beat with ${params.mood} vibes. Intensity level ${intensity}.`,
          genre: params.genre,
          mood: params.mood,
          intensity,
          audio_url: data.audioUrl,
          ai_prompt: params.prompt,
          tags: params.tags || [params.genre, params.mood, 'ai-generated'],
          generation_model: 'suno',
          created_by: 'prime'
        })
        .select()
        .single();

      if (saveError) throw saveError;

      toast.success('Prime generated a new beat!');
      await fetchBeats();
      return savedBeat as DemoBeat;
    } catch (err: any) {
      console.error('Error generating beat:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to generate beat');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteBeat = async (id: string) => {
    try {
      const { error } = await supabase
        .from('demo_beats')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Beat deleted');
      await fetchBeats();
    } catch (err: any) {
      console.error('Error deleting beat:', err);
      toast.error(err.message || 'Failed to delete beat');
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('demo_beats')
        .update({ is_featured: featured })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(featured ? 'Beat featured!' : 'Beat unfeatured');
      await fetchBeats();
    } catch (err: any) {
      console.error('Error updating beat:', err);
      toast.error(err.message || 'Failed to update beat');
    }
  };

  const incrementPlayCount = async (id: string) => {
    try {
      const beat = beats.find(b => b.id === id);
      if (!beat) return;

      await supabase
        .from('demo_beats')
        .update({ play_count: (beat.play_count || 0) + 1 })
        .eq('id', id);
    } catch (err) {
      console.error('Error incrementing play count:', err);
    }
  };

  useEffect(() => {
    fetchBeats();
  }, []);

  return {
    beats,
    isLoading,
    isGenerating,
    error,
    fetchBeats,
    generateBeat,
    deleteBeat,
    toggleFeatured,
    incrementPlayCount,
    featuredBeats: beats.filter(b => b.is_featured),
  };
}
