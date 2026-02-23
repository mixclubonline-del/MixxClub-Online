/**
 * useInviteCodes — Admin invite code generation and management
 *
 * Generate exclusive MIXX-XXXX-XXXX codes, track usage,
 * set expiry dates, and manage the invite pipeline.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface InviteCode {
    id: string;
    code: string;
    label: string | null;
    max_uses: number;
    times_used: number;
    role_grant: 'artist' | 'engineer' | 'producer' | 'fan' | null;
    created_by: string | null;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
}

export interface GenerateCodeOptions {
    label?: string;
    maxUses?: number;
    roleGrant?: 'artist' | 'engineer' | 'producer' | 'fan';
    expiresAt?: string; // ISO date
}

// ── Generate a unique MIXX-XXXX-XXXX code ──
function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 for readability
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `MIXX-${segment()}-${segment()}`;
}

// ── Admin: generate a new invite code ──
export function useGenerateInviteCode() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (options: GenerateCodeOptions = {}): Promise<InviteCode> => {
            const code = generateCode();

            const { data, error } = await supabase
                .from('invite_codes')
                .insert({
                    code,
                    label: options.label || null,
                    max_uses: options.maxUses || 1,
                    role_grant: options.roleGrant || null,
                    expires_at: options.expiresAt || null,
                    created_by: user?.id || null,
                    is_active: true,
                } as Record<string, unknown>)
                .select()
                .single();

            if (error) throw error;
            return data as InviteCode;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['invite-codes'] });
            toast.success(`Invite code generated: ${data.code}`);
        },
        onError: () => {
            toast.error('Failed to generate invite code');
        },
    });
}

// ── Validate an invite code (public) ──
export function useValidateInviteCode() {
    return useMutation({
        mutationFn: async (code: string): Promise<{ valid: boolean; message: string; roleGrant?: string }> => {
            const { data, error } = await supabase
                .from('invite_codes')
                .select('*')
                .eq('code', code.toUpperCase().trim())
                .maybeSingle();

            if (error) throw error;

            if (!data) return { valid: false, message: 'Invalid invite code' };
            if (!data.is_active) return { valid: false, message: 'This invite code has been deactivated' };
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                return { valid: false, message: 'This invite code has expired' };
            }
            if (data.times_used >= data.max_uses) {
                return { valid: false, message: 'This invite code has reached its limit' };
            }

            return {
                valid: true,
                message: 'Valid invite code',
                roleGrant: data.role_grant || undefined,
            };
        },
    });
}

// ── Admin: list all invite codes ──
export function useInviteCodeList() {
    return useQuery({
        queryKey: ['invite-codes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('invite_codes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []) as InviteCode[];
        },
    });
}

// ── Admin: deactivate/activate a code ──
export function useToggleInviteCode() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            const { error } = await supabase
                .from('invite_codes')
                .update({ is_active: isActive } as Record<string, unknown>)
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invite-codes'] });
            toast.success('Invite code updated');
        },
    });
}
