/**
 * CoinzPaymentToggle — UI widget for applying MixxCoinz to a purchase.
 * 
 * Shows balance, toggle to enable, slider for amount, and
 * real-time breakdown of coinz vs cash.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Coins, ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { TierDiscountBadge } from './TierDiscountBadge';
import type { CoinzCheckoutResult } from '@/hooks/useCoinzCheckout';

interface CoinzPaymentToggleProps {
    /** Price in cents before discounts */
    priceCents: number;
    /** User's total coinz balance */
    totalBalance: number;
    /** Max coinz usable for this price */
    maxCoinz: number;
    /** Current tier */
    tier: string;
    /** Tier discount percent */
    tierDiscountPercent: number;
    /** Calculate checkout result */
    onCalculate: (priceCents: number, coinzToApply: number) => CoinzCheckoutResult;
    /** Callback when coinz amount changes */
    onCoinzChange: (coinz: number) => void;
    className?: string;
}

export const CoinzPaymentToggle: React.FC<CoinzPaymentToggleProps> = ({
    priceCents,
    totalBalance,
    maxCoinz,
    tier,
    tierDiscountPercent,
    onCalculate,
    onCoinzChange,
    className,
}) => {
    const [enabled, setEnabled] = useState(false);
    const [coinzAmount, setCoinzAmount] = useState(0);
    const [checkout, setCheckout] = useState<CoinzCheckoutResult | null>(null);

    useEffect(() => {
        if (enabled && coinzAmount > 0) {
            const result = onCalculate(priceCents, coinzAmount);
            setCheckout(result);
            onCoinzChange(coinzAmount);
        } else {
            const result = onCalculate(priceCents, 0);
            setCheckout(result);
            onCoinzChange(0);
        }
    }, [enabled, coinzAmount, priceCents, onCalculate, onCoinzChange]);

    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
        if (!checked) {
            setCoinzAmount(0);
        } else {
            setCoinzAmount(maxCoinz);
        }
    };

    const formatCents = (cents: number) =>
        (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    if (totalBalance <= 0) return null;

    return (
        <div className={cn(
            'rounded-xl border transition-all',
            enabled ? 'bg-primary/5 border-primary/20' : 'bg-white/[0.02] border-white/8',
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        enabled ? 'bg-primary/20' : 'bg-white/5'
                    )}>
                        <Coins className={cn('h-4 w-4', enabled ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Pay with MixxCoinz</p>
                        <p className="text-[11px] text-muted-foreground">
                            Balance: {totalBalance.toLocaleString()} 🪙
                        </p>
                    </div>
                </div>
                <Switch checked={enabled} onCheckedChange={handleToggle} />
            </div>

            {/* Expanded content */}
            <AnimatePresence>
                {enabled && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 space-y-3">
                            {/* Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <Label className="text-muted-foreground">Coinz to apply</Label>
                                    <span className="font-mono text-foreground font-medium">
                                        {coinzAmount.toLocaleString()} 🪙
                                    </span>
                                </div>
                                <Slider
                                    value={[coinzAmount]}
                                    onValueChange={([v]) => setCoinzAmount(v)}
                                    min={0}
                                    max={maxCoinz}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>0</span>
                                    <span>Max: {maxCoinz.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Breakdown */}
                            {checkout && (
                                <div className="space-y-1.5 p-2.5 rounded-lg bg-black/20 text-xs">
                                    {/* Original price */}
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Original price</span>
                                        <span>{formatCents(priceCents)}</span>
                                    </div>

                                    {/* Tier discount */}
                                    {checkout.tierSavingsCents > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span className="flex items-center gap-1">
                                                Tier discount
                                                <TierDiscountBadge tier={tier} discountPercent={tierDiscountPercent} showLabel={false} />
                                            </span>
                                            <span>-{formatCents(checkout.tierSavingsCents)}</span>
                                        </div>
                                    )}

                                    {/* Coinz applied */}
                                    {checkout.coinzApplied > 0 && (
                                        <div className="flex justify-between text-primary">
                                            <span>🪙 MixxCoinz ({checkout.coinzApplied.toLocaleString()})</span>
                                            <span>-{formatCents(checkout.coinzApplied)}</span>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div className="border-t border-white/10 pt-1.5 mt-1">
                                        <div className="flex justify-between font-medium text-foreground">
                                            <span>You pay</span>
                                            <span>
                                                {checkout.fullyCoveredByCoinz
                                                    ? <span className="text-green-400">FREE ✨</span>
                                                    : formatCents(checkout.cashRemainingCents)
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tier discount hint (when collapsed) */}
            {!enabled && tierDiscountPercent > 0 && (
                <div className="px-3 pb-2.5">
                    <TierDiscountBadge tier={tier} discountPercent={tierDiscountPercent} />
                </div>
            )}
        </div>
    );
};
