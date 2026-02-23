/**
 * useCoinzCheckout — Hook for marketplace purchases with MixxCoinz.
 * 
 * Supports full/partial coinz payment and tier-based discounts.
 * Integrates with useMixxWallet for balance checking and spending.
 */

import { useCallback, useMemo } from 'react';
import { useMixxWallet } from './useMixxWallet';
import { useFanStats } from './useFanStats';

/** Tier-based discount percentages */
const TIER_DISCOUNTS: Record<string, number> = {
    newcomer: 0,
    supporter: 3,
    advocate: 5,
    champion: 10,
    legend: 15,
};

/** Coinz-to-cents conversion rate: 1 MixxCoinz = $0.01 (1 cent) */
const COINZ_TO_CENTS_RATE = 1;

export interface CoinzCheckoutOptions {
    /** Price in cents (USD) */
    priceCents: number;
    /** How many coinz the user wants to apply */
    coinzToApply: number;
    /** Item source for transaction tracking */
    source: string;
    /** Optional description */
    description?: string;
    /** Reference type for tx tracking */
    referenceType?: string;
    /** Reference ID for tx tracking */
    referenceId?: string;
}

export interface CoinzCheckoutResult {
    /** Price in cents after tier discount */
    discountedPriceCents: number;
    /** Tier discount percent applied */
    tierDiscountPercent: number;
    /** Amount saved from tier discount in cents */
    tierSavingsCents: number;
    /** How many coinz applied (capped to balance or discounted price) */
    coinzApplied: number;
    /** Remaining cash amount in cents after coinz applied */
    cashRemainingCents: number;
    /** Whether the entire purchase is covered by coinz */
    fullyCoveredByCoinz: boolean;
}

export function useCoinzCheckout() {
    const { wallet, totalBalance, canAfford, spendCoinz, isSpending } = useMixxWallet();
    const { currentTier } = useFanStats();

    /** Get the user's tier-based discount percentage */
    const tierDiscountPercent = useMemo(() => {
        return TIER_DISCOUNTS[currentTier] || 0;
    }, [currentTier]);

    /** Calculate checkout breakdown for a given price and coinz amount */
    const calculateCheckout = useCallback((
        priceCents: number,
        coinzToApply: number,
    ): CoinzCheckoutResult => {
        // 1. Apply tier discount
        const tierSavingsCents = Math.floor(priceCents * tierDiscountPercent / 100);
        const discountedPriceCents = priceCents - tierSavingsCents;

        // 2. Convert coinz to cents
        const coinzValueInCents = coinzToApply * COINZ_TO_CENTS_RATE;

        // 3. Cap coinz to discounted price and user balance
        const maxCoinzByPrice = Math.ceil(discountedPriceCents / COINZ_TO_CENTS_RATE);
        const effectiveCoinz = Math.min(coinzToApply, totalBalance, maxCoinzByPrice);

        // 4. Calculate remaining cash
        const coinzCoversCents = effectiveCoinz * COINZ_TO_CENTS_RATE;
        const cashRemainingCents = Math.max(0, discountedPriceCents - coinzCoversCents);

        return {
            discountedPriceCents,
            tierDiscountPercent,
            tierSavingsCents,
            coinzApplied: effectiveCoinz,
            cashRemainingCents,
            fullyCoveredByCoinz: cashRemainingCents === 0,
        };
    }, [totalBalance, tierDiscountPercent]);

    /** Execute the coinz portion of a checkout */
    const applyCoinzPayment = useCallback(async (options: CoinzCheckoutOptions) => {
        const checkout = calculateCheckout(options.priceCents, options.coinzToApply);

        if (checkout.coinzApplied <= 0) return checkout;

        // Spend the coinz
        await spendCoinz({
            amount: checkout.coinzApplied,
            source: options.source,
            description: options.description || `Marketplace purchase: ${checkout.coinzApplied} coinz applied`,
            referenceType: options.referenceType || 'marketplace',
            referenceId: options.referenceId,
        });

        return checkout;
    }, [calculateCheckout, spendCoinz]);

    /** Get max coinz usable for a given price */
    const maxCoinzForPrice = useCallback((priceCents: number) => {
        const discounted = priceCents - Math.floor(priceCents * tierDiscountPercent / 100);
        const maxByPrice = Math.ceil(discounted / COINZ_TO_CENTS_RATE);
        return Math.min(totalBalance, maxByPrice);
    }, [totalBalance, tierDiscountPercent]);

    return {
        // Data
        wallet,
        totalBalance,
        currentTier,
        tierDiscountPercent,
        tierDiscounts: TIER_DISCOUNTS,
        coinzToCentsRate: COINZ_TO_CENTS_RATE,

        // Calculation
        calculateCheckout,
        maxCoinzForPrice,
        canAfford,

        // Actions
        applyCoinzPayment,
        isProcessing: isSpending,
    };
}
