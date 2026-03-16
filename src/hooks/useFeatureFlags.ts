import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FEATURE_FLAGS } from '@/config/featureFlags';

interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

/**
 * Runtime feature flags hook — reads from DB with static fallback.
 * Returns the same shape as FEATURE_FLAGS for drop-in compatibility.
 */
export const useFeatureFlags = () => {
  const queryClient = useQueryClient();

  const { data: flags, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*');

      if (error) throw error;
      return (data || []) as FeatureFlag[];
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });

  // Build a merged map: DB values override static defaults
  const flagMap: Record<string, boolean> = { ...FEATURE_FLAGS };
  flags?.forEach((f) => {
    if (f.key in flagMap) {
      flagMap[f.key as keyof typeof FEATURE_FLAGS] = f.enabled;
    }
  });

  const isEnabled = (key: keyof typeof FEATURE_FLAGS): boolean => {
    return flagMap[key] ?? FEATURE_FLAGS[key] ?? false;
  };

  const toggleFlag = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled, updated_at: new Date().toISOString(), updated_by: user?.id })
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });

  return {
    flags: flags || [],
    flagMap,
    isEnabled,
    isLoading,
    toggleFlag,
  };
};
