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
  /* ─── HOME PAGE ─── */
  home: {
    // Hero
    hero_title: { content: 'Ready to Transform\nYour Sound?', content_type: 'text' },
    hero_subtitle: { content: 'From bedroom to billboard. AI meets human creativity in the ultimate music collaboration network.', content_type: 'text' },
    hero_badge: { content: 'AI-Powered Audio Engineering', content_type: 'text' },
    // Enhanced Hero
    enhanced_hero_title: { content: 'Your Music.\nWorld-Class\nEngineers.', content_type: 'text' },
    enhanced_hero_badge: { content: 'AI-Powered Matching', content_type: 'text' },
    // Value Proposition
    value_artist_title: { content: 'Stop Overpaying.\nStart Sounding Professional.', content_type: 'text' },
    value_engineer_title: { content: 'Turn Your Skills Into a Business', content_type: 'text' },
    // Network Explainer
    network_title: { content: 'One Network. Infinite Connections.', content_type: 'text' },
    network_subtitle: { content: "This isn't a platform. This is a network of creators. Find your people.", content_type: 'text' },
    // Community Showcase
    community_title: { content: 'Compete. Collaborate. Grow.', content_type: 'text' },
    community_subtitle: { content: 'Join mix battles, climb the leaderboards, and connect with engineers worldwide', content_type: 'text' },
    // Social Proof
    social_proof_title: { content: 'Hear From Our Community', content_type: 'text' },
    social_proof_subtitle: { content: 'Real stories from artists and engineers on the platform.', content_type: 'text' },
    // Footer
    footer_tagline: { content: 'Where Music Meets Technology', content_type: 'text' },
    footer_description: { content: 'The all-in-one ecosystem for Artists, Engineers, Producers, and Fans.', content_type: 'text' },
  },

  /* ─── MIXCLUB (MIXXCLUB BRANDED LANDING) ─── */
  mixclub: {
    hero_title: { content: 'Ready to Transform\nYour Sound?', content_type: 'text' },
    hero_subtitle: { content: 'From bedroom to billboard. AI meets human creativity in the ultimate music collaboration network.', content_type: 'text' },
    hero_badge: { content: 'AI-Powered Audio Engineering', content_type: 'text' },
  },

  /* ─── ABOUT PAGE ─── */
  about: {
    hero_title: { content: 'The Platform Built\nfor Music People', content_type: 'text' },
    hero_subtitle: { content: 'Four roles. One ecosystem. Every feature designed to elevate the way music is made, mixed, and experienced.', content_type: 'text' },
    mission_title: { content: 'Our Mission', content_type: 'text' },
    mission_body: { content: 'Mixxclub exists to give every creator — artist, engineer, producer, and fan — the tools, community, and economy to thrive. No gatekeepers. No middlemen. Just music.', content_type: 'text' },
    roles_title: { content: 'The Four Pillars', content_type: 'text' },
    values_title: { content: 'What We Stand For', content_type: 'text' },
  },

  /* ─── PRICING PAGE ─── */
  pricing: {
    hero_title: { content: 'Simple, Transparent Pricing', content_type: 'text' },
    hero_subtitle: { content: 'Pick a tier that matches your vision. Scale up anytime.', content_type: 'text' },
  },

  /* ─── FOR ARTISTS PORTAL ─── */
  'for-artists': {
    hero_title: { content: 'Your Music Deserves\nWorld-Class Sound', content_type: 'text' },
    hero_subtitle: { content: 'Get matched with vetted engineers, collaborate in real-time, and release distribution-ready tracks — all from one dashboard.', content_type: 'text' },
    hero_badge: { content: 'Artist Portal', content_type: 'text' },
  },

  /* ─── FOR ENGINEERS PORTAL ─── */
  'for-engineers': {
    hero_title: { content: 'Turn Your Audio Skills\nInto a Business', content_type: 'text' },
    hero_subtitle: { content: 'Access 10 revenue streams, build your verified reputation, and work with artists from every genre — on your schedule.', content_type: 'text' },
    hero_badge: { content: 'Engineer Portal', content_type: 'text' },
  },

  /* ─── FOR PRODUCERS PORTAL ─── */
  'for-producers': {
    hero_title: { content: 'Your Beats.\nGlobal Reach.', content_type: 'text' },
    hero_subtitle: { content: 'List beats, set custom licenses, collaborate via Beat Forge, and track royalties — from catalog to chart.', content_type: 'text' },
    hero_badge: { content: 'Producer Portal', content_type: 'text' },
  },

  /* ─── FOR FANS PORTAL ─── */
  'for-fans': {
    hero_title: { content: 'Discover. Support.\nOwn the Moment.', content_type: 'text' },
    hero_subtitle: { content: 'Find underground talent, earn Day 1 OG status, attend live premieres, and grow your rewards as your favorite artists rise.', content_type: 'text' },
    hero_badge: { content: 'Fan Portal', content_type: 'text' },
  },

  /* ─── HOW IT WORKS ─── */
  'how-it-works': {
    hero_title: { content: 'How Mixxclub Works', content_type: 'text' },
    hero_subtitle: { content: 'Three steps to professional-quality audio — powered by AI matching and real human engineers.', content_type: 'text' },
    step1_title: { content: 'Upload Your Track', content_type: 'text' },
    step1_body: { content: 'Drop your stems or mixed track. Our AI analyzes genre, tempo, and sonic profile instantly.', content_type: 'text' },
    step2_title: { content: 'Get Matched', content_type: 'text' },
    step2_body: { content: 'We pair you with an engineer whose style, speciality, and availability fit your project perfectly.', content_type: 'text' },
    step3_title: { content: 'Collaborate & Release', content_type: 'text' },
    step3_body: { content: 'Work together in real-time, approve revisions, and distribute to 150+ platforms when you are ready.', content_type: 'text' },
  },

  /* ─── CONTACT ─── */
  contact: {
    hero_title: { content: 'Get in Touch', content_type: 'text' },
    hero_subtitle: { content: 'Have a question, partnership proposal, or just want to say hello? We would love to hear from you.', content_type: 'text' },
  },

  /* ─── FAQ ─── */
  faq: {
    hero_title: { content: 'Frequently Asked Questions', content_type: 'text' },
    hero_subtitle: { content: 'Everything you need to know about Mixxclub — from pricing to platform features.', content_type: 'text' },
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
