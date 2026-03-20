import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fromAny = (table: string) => (supabase.from as any)(table);

export interface LandingBlock {
  id: string;
  type: string;
  props: Record<string, any>;
}

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  is_published: boolean;
  blocks: LandingBlock[];
  metadata: Record<string, any>;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Fetch all landing pages (admin) */
export function useAllLandingPages() {
  return useQuery<LandingPage[]>({
    queryKey: ['landing-pages'],
    queryFn: async () => {
      const { data, error } = await fromAny('landing_pages')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(normalizePage);
    },
  });
}

/** Fetch a single published landing page by slug (public) */
export function useLandingPage(slug: string) {
  return useQuery<LandingPage | null>({
    queryKey: ['landing-page', slug],
    queryFn: async () => {
      const { data, error } = await fromAny('landing_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data ? normalizePage(data) : null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Create a new landing page */
export function useCreateLandingPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (page: { slug: string; title: string; description?: string; created_by?: string }) => {
      const { data, error } = await fromAny('landing_pages')
        .insert({ ...page, blocks: [] })
        .select()
        .single();
      if (error) throw error;
      return normalizePage(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}

/** Update a landing page (blocks, title, publish state, etc.) */
export function useUpdateLandingPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LandingPage> & { id: string }) => {
      const { error } = await fromAny('landing_pages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['landing-pages'] });
      qc.invalidateQueries({ queryKey: ['landing-page'] });
    },
  });
}

/** Delete a landing page */
export function useDeleteLandingPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromAny('landing_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['landing-pages'] }),
  });
}

function normalizePage(raw: any): LandingPage {
  return {
    ...raw,
    blocks: Array.isArray(raw.blocks) ? raw.blocks : [],
    metadata: raw.metadata ?? {},
  };
}
