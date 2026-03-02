/**
 * CoinzPricingDisplay — Dual pricing (USD + coinz) for marketplace items.
 * 
 * Shows both prices side-by-side, with tier discount applied.
 * Makes coinz feel like real currency, not a coupon.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Coins } from 'lucide-react';

interface CoinzPricingDisplayProps {
    /** Price in cents */
    priceCents: number;
    /** Coinz-to-cents conversion rate (default 1:1) */
    coinzRate?: number;
    /** User's tier discount percent */
    tierDiscountPercent?: number;
    /** Layout mode */
    variant?: 'inline' | 'stacked';
    /** Size */
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const CoinzPricingDisplay: React.FC<CoinzPricingDisplayProps> = ({
    priceCents,
    coinzRate = 1,
    tierDiscountPercent = 0,
    variant = 'inline',
    size = 'md',
    className,
}) => {
    const usdPrice = (priceCents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const coinzPrice = Math.ceil(priceCents / coinzRate);
    const discountedCoinz = tierDiscountPercent > 0
        ? Math.ceil(coinzPrice * (1 - tierDiscountPercent / 100))
        : coinzPrice;

    const sizes = {
        sm: { usd: 'text-sm', coinz: 'text-[10px]', icon: 'h-2.5 w-2.5' },
        md: { usd: 'text-base', coinz: 'text-xs', icon: 'h-3 w-3' },
        lg: { usd: 'text-xl', coinz: 'text-sm', icon: 'h-3.5 w-3.5' },
    };

    const s = sizes[size];

    if (variant === 'stacked') {
        return (
            <div className={cn('flex flex-col', className)}>
                <span className={cn('font-bold text-foreground', s.usd)}>{usdPrice}</span>
                <span className={cn('flex items-center gap-0.5 text-amber-400 font-medium', s.coinz)}>
                    or {discountedCoinz.toLocaleString()}
                    <Coins className={s.icon} />
                    {tierDiscountPercent > 0 && (
                        <span className="text-green-400 text-[9px]">(-{tierDiscountPercent}%)</span>
                    )}
                </span>
            </div>
        );
    }

    return (
        <div className={cn('flex items-center gap-1.5', className)}>
            <span className={cn('font-bold text-foreground', s.usd)}>{usdPrice}</span>
            <span className="text-muted-foreground text-[10px]">or</span>
            <span className={cn('flex items-center gap-0.5 text-amber-400 font-medium', s.coinz)}>
                {discountedCoinz.toLocaleString()}
                <Coins className={s.icon} />
            </span>
        </div>
    );
};
