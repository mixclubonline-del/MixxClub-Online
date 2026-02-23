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
            if (!user?.id || !wallet) throw new Error('Not authenticated');
            if (!canAfford(amount)) throw new Error('Insufficient balance');
            if (amount <= 0) throw new Error('Amount must be positive');
            if (recipientId === user.id) throw new Error("Can't gift to yourself");

            // 1. Deduct from sender — prefer purchased balance for gifts
            const purchasedToSpend = Math.min(wallet.purchased_balance, amount);
            const earnedToSpend = amount - purchasedToSpend;

            const { error: senderError } = await supabase
                .from('mixx_wallets')
                .update({
                    purchased_balance: wallet.purchased_balance - purchasedToSpend,
                    earned_balance: wallet.earned_balance - earnedToSpend,
                    total_spent: wallet.total_spent + amount,
                    total_gifted: wallet.total_gifted + amount,
                })
                .eq('user_id', user.id);

            if (senderError) throw senderError;

            // 2. Credit to recipient
            const { data: recipientWallet, error: rpcError } = await supabase
                .rpc('get_or_create_wallet', { p_user_id: recipientId });

            if (rpcError) throw rpcError;

            const rw = recipientWallet as { earned_balance: number; total_received: number; total_earned: number };

            const { error: recipientError } = await supabase
                .from('mixx_wallets')
                .update({
                    earned_balance: rw.earned_balance + amount,
                    total_received: rw.total_received + amount,
                    total_earned: rw.total_earned + amount,
                })
                .eq('user_id', recipientId);

            if (recipientError) throw recipientError;

            // 3. Record paired transactions
            const { error: txError } = await supabase
                .from('mixx_transactions')
                .insert([
                    {
                        user_id: user.id,
                        transaction_type: 'GIFT_SENT',
                        source: 'gift',
                        amount,
                        balance_type: purchasedToSpend > 0 ? 'purchased' : 'earned',
                        counterparty_id: recipientId,
                        description: message || `Gift sent`,
                    },
                    {
                        user_id: recipientId,
                        transaction_type: 'GIFT_RECEIVED',
                        source: 'gift',
                        amount,
                        balance_type: 'earned',
                        counterparty_id: user.id,
                        description: message || `Gift received`,
                    },
                ]);

            if (txError) throw txError;

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
