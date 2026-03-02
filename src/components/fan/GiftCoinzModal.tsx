/**
 * GiftCoinzModal — Send MixxCoinz to another user.
 * 
 * Amount selector, optional message, balance check, animated send.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Gift, Coins, Send, Loader2 } from 'lucide-react';
import { useGiftCoinz } from '@/hooks/useGiftCoinz';
import { useMixxWallet } from '@/hooks/useMixxWallet';

interface GiftCoinzModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipient: {
        id: string;
        username?: string;
        full_name?: string;
        avatar_url?: string;
    };
}

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export function GiftCoinzModal({ open, onOpenChange, recipient }: GiftCoinzModalProps) {
    const [amount, setAmount] = useState(25);
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);
    const { giftCoinz, isGifting } = useGiftCoinz();
    const { totalBalance, canAfford } = useMixxWallet();

    const handleSend = async () => {
        if (!canAfford(amount) || amount <= 0) return;

        await giftCoinz({
            recipientId: recipient.id,
            amount,
            message: message || undefined,
        });

        setSent(true);
        setTimeout(() => {
            setSent(false);
            setAmount(25);
            setMessage('');
            onOpenChange(false);
        }, 2000);
    };

    const initials = recipient.full_name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase() || '?';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        Gift MixxCoinz
                    </DialogTitle>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {sent ? (
                        <motion.div
                            key="sent"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                                className="text-5xl mb-4"
                            >
                                🎁
                            </motion.div>
                            <p className="text-lg font-bold text-foreground">Gift Sent!</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {amount} coinz delivered to {recipient.full_name || recipient.username}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div key="form" className="space-y-5">
                            {/* Recipient */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={recipient.avatar_url || undefined} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{recipient.full_name || recipient.username}</p>
                                    {recipient.username && (
                                        <p className="text-xs text-muted-foreground">@{recipient.username}</p>
                                    )}
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Amount</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {QUICK_AMOUNTS.map((qa) => (
                                        <button
                                            key={qa}
                                            onClick={() => setAmount(qa)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                                amount === qa
                                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                                    : 'bg-white/5 text-muted-foreground border border-white/8 hover:bg-white/10'
                                            )}
                                        >
                                            {qa} 🪙
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                    min={1}
                                    max={totalBalance}
                                    className="h-9 bg-white/5 border-white/10 text-sm"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Balance: {totalBalance.toLocaleString()} 🪙
                                    {!canAfford(amount) && (
                                        <span className="text-red-400 ml-2">Insufficient balance</span>
                                    )}
                                </p>
                            </div>

                            {/* Message */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Message (optional)</Label>
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Keep creating! 🔥"
                                    maxLength={120}
                                    className="h-9 bg-white/5 border-white/10 text-sm"
                                />
                            </div>

                            {/* Send */}
                            <Button
                                onClick={handleSend}
                                disabled={isGifting || !canAfford(amount) || amount <= 0}
                                className="w-full gap-2"
                            >
                                {isGifting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                Send {amount} MixxCoinz
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
