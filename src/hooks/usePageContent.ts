import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fromAny = (table: string) => (supabase.from as any)(table);

export interface PageContentEntry {
  id: string;
  page_slug: string;
  section_key: string;
  content_type: 'text' | 'rich_text' | 'image' | 'json';
  content: string;
  metadata: Record<string, unknown>;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// Default content map — used when no DB entry exists
const DEFAULTS: Record<string, Record<string, { content: string; content_type: string }>> = {
  home: {
    hero_title: { content: 'Ready to Transform\nYour Sound?', content_type: 'text' },
    hero_subtitle: { content: 'From bedroom to billboard. AI meets human creativity in the ultimate music collaboration network.', content_type: 'text' },
    hero_badge: { content: 'AI-Powered Audio Engineering', content_type: 'text' },
  },
};

function getDefault(pageSlug: string, sectionKey: string): string {
  return DEFAULTS[pageSlug]?.[sectionKey]?.content ?? '';
}

/**
 * Fetch a single content block by page + section key.
 * Falls back to hardcoded defaults if nothing is in the DB.
 */
export function usePageContent(pageSlug: string, sectionKey: string) {
  const query = useQuery<string>({
    queryKey: ['page-content', pageSlug, sectionKey],
    queryFn: async () => {
      const { data, error } = await fromAny('page_content')
        .select('content')
        .eq('page_slug', pageSlug)
        .eq('section_key', sectionKey)
        .maybeSingle();

      if (error) throw error;
      return (data as any)?.content ?? getDefault(pageSlug, sectionKey);
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    content: query.data ?? getDefault(pageSlug, sectionKey),
    isLoading: query.isLoading,
  };
}

/**
 * Fetch ALL content for a given page slug (admin editor uses this).
 */
export function usePageContentBySlug(pageSlug: string) {
  return useQuery<PageContentEntry[]>({
    queryKey: ['page-content', pageSlug],
    queryFn: async () => {
      const { data, error } = await fromAny('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .order('section_key');

      if (error) throw error;
      return (data as PageContentEntry[]) ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch ALL page content entries (admin overview).
 */
export function useAllPageContent() {
  return useQuery<PageContentEntry[]>({
    queryKey: ['page-content-all'],
    queryFn: async () => {
      const { data, error } = await fromAny('page_content')
        .select('*')
        .order('page_slug')
        .order('section_key');

      if (error) throw error;
      return (data as PageContentEntry[]) ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Upsert a page content block (admin-only).
 */
export function useUpsertPageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: {
      page_slug: string;
      section_key: string;
      content_type: string;
      content: string;
      metadata?: Record<string, unknown>;
      updated_by?: string;
    }) => {
      const { error } = await fromAny('page_content').upsert(
        {
          ...entry,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page_slug,section_key' }
      );

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['page-content', vars.page_slug, vars.section_key] });
      queryClient.invalidateQueries({ queryKey: ['page-content', vars.page_slug] });
      queryClient.invalidateQueries({ queryKey: ['page-content-all'] });
    },
  });
}

/**
 * Delete a page content entry (admin-only).
 */
export function useDeletePageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromAny('page_content').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-content-all'] });
    },
  });
}

/** Exported defaults so the admin editor can seed new entries */
export { DEFAULTS as PAGE_CONTENT_DEFAULTS };
