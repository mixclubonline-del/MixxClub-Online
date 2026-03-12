import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fromAny = (table: string) => (supabase.from as any)(table);

interface BrandConfig {
  brand_name: string;
  brand_logo_url: string | null;
  brand_primary_color: string;
  brand_accent_color: string;
  custom_domain: string | null;
}

const DEFAULTS: BrandConfig = {
  brand_name: 'Mixx Club',
  brand_logo_url: null,
  brand_primary_color: '280 100% 65%',
  brand_accent_color: '320 90% 60%',
  custom_domain: null,
};

const BRAND_KEYS = ['brand_name', 'brand_logo_url', 'brand_primary_color', 'brand_accent_color', 'custom_domain'];

export function useBrandConfig() {
  const { data: config, isLoading } = useQuery({
    queryKey: ['brand-config'],
    queryFn: async () => {
      const { data, error } = await fromAny('platform_config')
        .select('key, value')
        .in('key', BRAND_KEYS);
      if (error) throw error;

      const result = { ...DEFAULTS };
      (data || []).forEach((row: any) => {
        const key = row.key as keyof BrandConfig;
        if (key in result) {
          try {
            (result as any)[key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
          } catch {
            (result as any)[key] = row.value;
          }
        }
      });
      return result;
    },
    staleTime: 10 * 60_000,
  });

  // Apply CSS custom properties when brand config changes
  useEffect(() => {
    if (!config) return;
    const root = document.documentElement;

    if (config.brand_primary_color && config.brand_primary_color !== DEFAULTS.brand_primary_color) {
      root.style.setProperty('--primary', config.brand_primary_color);
    }
    if (config.brand_accent_color && config.brand_accent_color !== DEFAULTS.brand_accent_color) {
      root.style.setProperty('--accent', config.brand_accent_color);
    }

    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
    };
  }, [config]);

  return {
    config: config || DEFAULTS,
    isLoading,
  };
}
