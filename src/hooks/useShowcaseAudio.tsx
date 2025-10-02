import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AudioSample {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  category: string;
  before_file_path: string;
  after_file_path: string;
  before_file_name: string;
  after_file_name: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  beforeUrl?: string;
  afterUrl?: string;
}

export const useShowcaseAudio = (category?: string) => {
  const [samples, setSamples] = useState<AudioSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSamples();
  }, [category]);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('showcase_audio_samples')
        .select('*')
        .order('display_order', { ascending: true });

      if (category) {
        query = query.or(`category.eq.${category},category.eq.both`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Generate public URLs for audio files
      const samplesWithUrls = await Promise.all(
        (data || []).map(async (sample) => {
          const { data: beforeUrlData } = supabase.storage
            .from('showcase-audio')
            .getPublicUrl(sample.before_file_path);

          const { data: afterUrlData } = supabase.storage
            .from('showcase-audio')
            .getPublicUrl(sample.after_file_path);

          return {
            ...sample,
            beforeUrl: beforeUrlData.publicUrl,
            afterUrl: afterUrlData.publicUrl,
          };
        })
      );

      setSamples(samplesWithUrls);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audio samples');
      console.error('Error fetching showcase audio:', err);
    } finally {
      setLoading(false);
    }
  };

  return { samples, loading, error, refetch: fetchSamples };
};
