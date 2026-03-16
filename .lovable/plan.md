

# Service Checkout Consolidation

## Problem
Five separate edge functions do essentially the same thing — authenticate user, fetch package, create Stripe checkout session:

| Function | Table | Mode | Extras |
|---|---|---|---|
| `create-mixing-checkout` | `mixing_packages` | payment | referralCode |
| `create-mastering-checkout` | `mastering_packages` | payment | referralCode |
| `create-distribution-checkout` | `distribution_packages` | subscription | referralCode, billing_cycle |
| `create-payment-checkout` | all 4 tables | payment/subscription | customer create/lookup, successUrl/cancelUrl |
| `create-addon-payment` | `add_on_services` | PaymentIntent (not checkout) | rate limiting, Zod validation |

`create-payment-checkout` already handles mixing, mastering, distribution, and addon — making the 3 specific functions redundant.

## Plan

### 1. Upgrade `create-payment-checkout` to be the canonical function
- Add `referralCode` support (missing today, but the specific functions have it)
- Add Stripe customer create-or-find logic (already present)
- Handle distribution `billing_cycle` (monthly vs annual) from the package data
- Use field-name normalization for distribution packages (`package_name`→`name`, `package_description`→`description`)
- Import constants from `_shared/constants.ts`

### 2. Migrate `create-addon-payment` into `create-payment-checkout`
- `create-addon-payment` uses a PaymentIntent (not Checkout Session), which is a different flow used by `CheckoutForm.tsx` with embedded Stripe Elements
- Keep `create-addon-payment` as-is since it serves a fundamentally different payment UX (embedded form vs redirect)

### 3. Update frontend callers
- **`src/pages/Checkout.tsx`**: Remove the `isMixing`/`isMastering` branches. All cases (except subscription) route to `create-payment-checkout` with `{ packageType, packageId, referralCode }`
- **`src/components/mastering/MasteringPackages.tsx`**: Change `create-mastering-checkout` → `create-payment-checkout` with `{ packageType: 'mastering', packageId }`
- **`src/components/mastering/PackageRecommendation.tsx`**: Same change

### 4. Delete redundant edge functions
- Delete `supabase/functions/create-mixing-checkout/index.ts`
- Delete `supabase/functions/create-mastering-checkout/index.ts`
- Delete `supabase/functions/create-distribution-checkout/index.ts`

### Files Modified
- `supabase/functions/create-payment-checkout/index.ts` — add referralCode, normalize field names
- `src/pages/Checkout.tsx` — simplify checkout branching
- `src/components/mastering/MasteringPackages.tsx` — update function name
- `src/components/mastering/PackageRecommendation.tsx` — update function name

### Files Deleted
- `supabase/functions/create-mixing-checkout/index.ts`
- `supabase/functions/create-mastering-checkout/index.ts`
- `supabase/functions/create-distribution-checkout/index.ts`

