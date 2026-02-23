/**
 * useGiftCoinz — Hook for gifting MixxCoinz between users.
 * 
 * Creates paired GIFT_SENT / GIFT_RECEIVED transactions using
 * the existing wallet infrastructure.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMixxWallet } from './useMixxWallet';

interface GiftOptions {
    recipientId: string;
    amount: number;
    message?: string;
}

export function useGiftCoinz() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { wallet, canAfford } = useMixxWallet();

    const giftMutation = useMutation({
        mutationFn: async ({ recipientId, amount, message }: GiftOptions) => {
            if (!user?.id) throw new Error('Not authenticated');
            if (amount <= 0) throw new Error('Amount must be positive');
            if (recipientId === user.id) throw new Error("Can't gift to yourself");

            // Atomic RPC — sender deduct + recipient credit + both transactions
            // in a single Postgres transaction with row locks. If ANY step fails,
            // the entire operation rolls back. No more lost coins.
            const { data, error } = await supabase.rpc('gift_coinz', {
                p_sender_id: user.id,
                p_recipient_id: recipientId,
                p_amount: amount,
                p_message: message || null,
            });

            if (error) throw error;
            return { amount, recipientId };
        },
        onSuccess: ({ amount }) => {
            queryClient.invalidateQueries({ queryKey: ['mixx-wallet'] });
            queryClient.invalidateQueries({ queryKey: ['mixx-transactions'] });
            toast({
                title: '🎁 Gift Sent!',
                description: `${amount} MixxCoinz delivered successfully`,
            });
        },
        onError: (error) => {
            toast({
                title: 'Gift Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    return {
        giftCoinz: giftMutation.mutateAsync,
        isGifting: giftMutation.isPending,
        canAfford,
    };
}
