import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import JSZip from 'jszip';

export interface SamplePackItem {
  beat_id: string;
  title: string;
  audio_url?: string;
  type: 'beat' | 'stem' | 'loop';
}

export interface SamplePack {
  id: string;
  producer_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  price_cents: number;
  status: string;
  items: SamplePackItem[];
  download_count: number;
  created_at: string;
  updated_at: string;
}

export function useSamplePacks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const packsQuery = useQuery({
    queryKey: ['sample-packs', user?.id],
    queryFn: async (): Promise<SamplePack[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('sample_packs')
        .select('*')
        .eq('producer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        items: (d.items as unknown as SamplePackItem[]) || [],
      }));
    },
    enabled: !!user?.id,
  });

  const createPack = useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      cover_url?: string;
      price_cents: number;
      items: SamplePackItem[];
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('sample_packs')
        .insert([{
          producer_id: user.id,
          title: input.title,
          description: input.description || null,
          cover_url: input.cover_url || null,
          price_cents: input.price_cents,
          items: JSON.parse(JSON.stringify(input.items)),
          status: 'draft',
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-packs'] });
      toast.success('Sample pack created');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const publishPack = useMutation({
    mutationFn: async (packId: string) => {
      const { error } = await supabase
        .from('sample_packs')
        .update({ status: 'published', updated_at: new Date().toISOString() })
        .eq('id', packId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-packs'] });
      toast.success('Pack published');
    },
  });

  const deletePack = useMutation({
    mutationFn: async (packId: string) => {
      const { error } = await supabase.from('sample_packs').delete().eq('id', packId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-packs'] });
      toast.success('Pack deleted');
    },
  });

  const downloadPackAsZip = async (pack: SamplePack) => {
    const zip = new JSZip();
    const folder = zip.folder(pack.title) || zip;

    for (const item of pack.items) {
      if (!item.audio_url) continue;
      try {
        const response = await fetch(item.audio_url);
        const blob = await response.blob();
        const ext = item.audio_url.split('.').pop()?.split('?')[0] || 'mp3';
        folder.file(`${item.title}.${ext}`, blob);
      } catch {
        console.warn(`Failed to fetch ${item.title}`);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.title}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    packs: packsQuery.data || [],
    isLoading: packsQuery.isLoading,
    createPack,
    publishPack,
    deletePack,
    downloadPackAsZip,
  };
}
