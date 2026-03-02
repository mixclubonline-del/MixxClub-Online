/**
 * usePlatformConfig — Admin-controlled platform settings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const fromAny = (table: string) => (supabase.from as any)(table);

type LaunchMode = 'pre_launch' | 'live';

async function getConfig<T>(key: string): Promise<T | null> {
    const { data, error } = await fromAny('platform_config')
        .select('value')
        .eq('key', key)
        .maybeSingle();

    if (error) throw error;
    return (data as any)?.value as T ?? null;
}

export function useLaunchMode() {
    return useQuery({
        queryKey: ['platform-config', 'launch_mode'],
        queryFn: () => getConfig<LaunchMode>('launch_mode'),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    });
}

export function useIsPreLaunch(): boolean {
    const { data: mode } = useLaunchMode();
    return mode === 'pre_launch';
}

export function useUpdateConfig() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
            const { error } = await fromAny('platform_config')
                .upsert({
                    key,
                    value: JSON.stringify(value),
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id,
                }, { onConflict: 'key' });

            if (error) throw error;
        },
        onSuccess: (_, { key }) => {
            queryClient.invalidateQueries({ queryKey: ['platform-config', key] });
            toast.success('Platform config updated');
        },
        onError: () => { toast.error('Failed to update config'); },
    });
}

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
