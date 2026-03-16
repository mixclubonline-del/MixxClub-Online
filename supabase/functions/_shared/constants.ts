/**
 * Shared Business Constants
 * Centralized platform-wide financial and operational constants
 */

/** Platform keeps 30% of service payments */
export const PLATFORM_FEE_PERCENTAGE = 0.30;

/** Engineers receive 70% of service payments */
export const ENGINEER_SHARE_PERCENTAGE = 0.70;

/** Stripe SDK import path — single source of truth */
export const STRIPE_IMPORT = 'https://esm.sh/stripe@18.5.0';

/** Stripe API version — must match across all functions */
export const STRIPE_API_VERSION = '2025-08-27.basil' as const;

/** MixxCoinz daily purchase limit per user */
export const DAILY_COINZ_PURCHASE_LIMIT = 2000;

/** Beat marketplace platform fee percentage */
export const BEAT_PLATFORM_FEE_PERCENTAGE = 0.15;

/** Minimum payout amount in USD */
export const MINIMUM_PAYOUT_AMOUNT = 50;

/** Coinz-to-cents conversion rate: 1 MixxCoinz = $0.01 */
export const COINZ_TO_CENTS_RATE = 1;

/** Referral commission tiers */
export const REFERRAL_COMMISSION_TIERS = {
  BRONZE: { minReferrals: 0, rate: 0.10 },
  SILVER: { minReferrals: 10, rate: 0.15 },
  GOLD: { minReferrals: 50, rate: 0.20 },
  PLATINUM: { minReferrals: 200, rate: 0.30 },
} as const;
