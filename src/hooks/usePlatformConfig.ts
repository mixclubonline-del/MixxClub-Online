/**
 * usePlatformConfig — Admin-controlled platform settings
 *
 * Provides launch mode detection and toggle for the pre-launch system.
 * Config is stored in Supabase `platform_config` table as key-value pairs.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type LaunchMode = 'pre_launch' | 'live';

interface PlatformConfigRow {
    key: string;
    value: unknown;
    updated_at: string;
    updated_by: string | null;
}

// ── Fetch a single config value ──
async function getConfig<T>(key: string): Promise<T | null> {
    const { data, error } = await supabase
        .from('platform_config')
        .select('value')
        .eq('key', key)
        .maybeSingle();

    if (error) throw error;
    return data?.value as T ?? null;
}

// ── Launch mode ──
export function useLaunchMode() {
    return useQuery({
        queryKey: ['platform-config', 'launch_mode'],
        queryFn: () => getConfig<LaunchMode>('launch_mode'),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000,
    });
}

export function useIsPreLaunch(): boolean {
    const { data: mode } = useLaunchMode();
    return mode === 'pre_launch';
}

// ── Admin: update config ──
export function useUpdateConfig() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
            const { error } = await supabase
                .from('platform_config')
                .upsert({
                    key,
                    value: JSON.stringify(value),
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id,
                } as unknown as Record<string, unknown>, { onConflict: 'key' });

            if (error) throw error;
        },
        onSuccess: (_, { key }) => {
            queryClient.invalidateQueries({ queryKey: ['platform-config', key] });
            toast.success('Platform config updated');
        },
        onError: () => {
            toast.error('Failed to update config');
        },
    });
}

// ── Admin: toggle launch mode ──
export function useToggleLaunchMode() {
    const { data: currentMode } = useLaunchMode();
    const updateConfig = useUpdateConfig();

    return useMutation({
        mutationFn: async () => {
            const newMode: LaunchMode = currentMode === 'pre_launch' ? 'live' : 'pre_launch';
            await updateConfig.mutateAsync({ key: 'launch_mode', value: newMode });
            return newMode;
        },
    });
}
