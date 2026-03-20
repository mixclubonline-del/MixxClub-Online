import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
  open_in_new_tab: boolean;
  requires_auth: boolean;
  nav_group: string;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}

type NavItemInsert = Omit<NavItem, 'id' | 'created_at' | 'updated_at'>;
type NavItemUpdate = Partial<NavItemInsert> & { id: string };

const NAV_QUERY_KEY = ['nav_items'];

/**
 * Fetch all nav items (admin sees all, public sees visible only via RLS).
 */
export function useNavItems(group?: string) {
  return useQuery({
    queryKey: [...NAV_QUERY_KEY, group ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('nav_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (group) q = q.eq('nav_group', group);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as NavItem[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch only visible nav items for the public site.
 */
export function usePublicNavItems(group = 'main') {
  return useQuery({
    queryKey: ['public_nav_items', group],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nav_items')
        .select('*')
        .eq('nav_group', group)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as NavItem[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertNavItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: NavItemInsert & { id?: string }) => {
      const { id, ...rest } = item as any;
      if (id) {
        const { error } = await supabase.from('nav_items').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('nav_items').insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NAV_QUERY_KEY }),
  });
}

export function useUpdateNavItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: NavItemUpdate) => {
      const { error } = await supabase.from('nav_items').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NAV_QUERY_KEY }),
  });
}

export function useDeleteNavItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('nav_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NAV_QUERY_KEY }),
  });
}

export function useReorderNavItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      for (const item of items) {
        const { error } = await supabase
          .from('nav_items')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: NAV_QUERY_KEY }),
  });
}

/** Default nav items to seed */
export const NAV_DEFAULTS: Omit<NavItemInsert, 'metadata'>[] = [
  { label: 'Home', href: '/', icon: 'Home', sort_order: 0, is_visible: true, open_in_new_tab: false, requires_auth: false, nav_group: 'main', parent_id: null },
  { label: 'About', href: '/about', icon: 'Info', sort_order: 1, is_visible: true, open_in_new_tab: false, requires_auth: false, nav_group: 'main', parent_id: null },
  { label: 'For Artists', href: '/for-artists', icon: 'Mic2', sort_order: 2, is_visible: true, open_in_new_tab: false, requires_auth: false, nav_group: 'main', parent_id: null },
  { label: 'For Engineers', href: '/for-engineers', icon: 'Headphones', sort_order: 3, is_visible: true, open_in_new_tab: false, requires_auth: false, nav_group: 'main', parent_id: null },
  { label: 'For Producers', href: '/for-producers', icon: 'Piano', sort_order: 4, is_visible: true, open_in_new_tab: false, requires_auth: false, nav_group: 'main', parent_id: null },
  { label: 'For Fans', href: '/for-fans', icon: 'Heart', sort_order: 5, is_visible: true, open_in_new_tab: false, requires_auth: false, nav_group: 'main', parent_id: null },
  { label: 'Pricing', href: '/pricing', icon: 'CreditCard', sort_order: 6, is_visible: true, open_in_new_tab: false, requires_auth: false, nav_group: 'main', parent_id: null },
  { label: 'FAQ', href: '/faq', icon: 'HelpCircle', sort_order: 7, is_visible: true, open_in_new_tab: false, requires_auth: false, nav_group: 'main', parent_id: null },
  { label: 'Contact', href: '/contact', icon: 'Mail', sort_order: 8, is_visible: true, open_in_new_tab: false, requires_auth: false, nav_group: 'main', parent_id: null },
  { label: 'Sessions', href: '/sessions', icon: 'Radio', sort_order: 0, is_visible: true, open_in_new_tab: false, requires_auth: true, nav_group: 'footer', parent_id: null },
  { label: 'Engineers', href: '/engineers', icon: 'Headphones', sort_order: 1, is_visible: true, open_in_new_tab: false, requires_auth: false, nav_group: 'footer', parent_id: null },
  { label: 'Community', href: '/crowd', icon: 'Users', sort_order: 2, is_visible: true, open_in_new_tab: false, requires_auth: false, nav_group: 'footer', parent_id: null },
];
