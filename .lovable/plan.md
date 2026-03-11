

# Phase 5: Revenue Hardening & Referral Activation

With the Stripe payment chain (checkout → webhook → subscription verification) now live, and stub pages built out, the next logical phases close the remaining roadmap gaps: **referral verification + reward processing** and **usage enforcement**.

## What's Left (from roadmap)

1. **Referral code verification + reward processing** — signup flow doesn't read `?ref=` param, so referral codes are generated but never redeemed
2. **Usage enforcement middleware** — `FeatureGated` checks community milestones but doesn't enforce subscription-tier usage limits (tracks/month, storage, etc.)
3. **FeatureGated → Upgrade button wiring** — the "Upgrade Now" button in the subscription lock overlay doesn't navigate anywhere

## Implementation Plan

### Step 1: Referral Verification on Signup
- Update the auth/signup page to read `?ref=` query param from the URL
- On successful signup, look up the referral code in the `referrals` table
- If found, set `referred_user_id` to the new user's ID, update status to `'completed'`
- Award coinz to both referrer (100) and new user (50) via existing `useMixxWallet.earnCoinz`
- Store `referred_by` on the new user's profile for tracking

**Files**: `src/pages/Auth.tsx` (or signup component), `src/hooks/useReferralSystem.ts`

### Step 2: Usage Enforcement Hook
- Create `useUsageEnforcement` hook that:
  - Reads current subscription tier from `useSubscriptionManagement`
  - Reads usage counts from `user_subscriptions.usage_current`
  - Exposes `canUseFeature(feature)` and `trackUsage(feature)` methods
  - Returns `{ withinLimits, usagePercent, limitReached }` state
- Integrate into key action points: project creation, audio upload, AI matching requests

**Files**: `src/hooks/useUsageEnforcement.ts` (new), integrate into `useProjectCreation`, audio upload flow

### Step 3: Wire FeatureGated Upgrade Button
- In `FeatureGated.tsx`, make the "Upgrade Now" button navigate to `/pricing` using `useNavigate`
- Add the current feature name as a query param so the pricing page can highlight the relevant tier

**Files**: `src/components/backend/FeatureGated.tsx`

### Step 4: Subscription Status on Dashboard
- Add a compact subscription badge to `EnhancedDashboardHub` showing current tier + usage bar
- Link to `/freemium` for plan management
- Show "Upgrade" CTA for free-tier users

**Files**: `src/components/crm/dashboard/EnhancedDashboardHub.tsx`

## Dependency Order

```text
Step 1 (Referral Verification) ──┐
Step 2 (Usage Enforcement)  ─────┼── Step 4 (Dashboard Badge)
Step 3 (Upgrade Button Wire) ────┘
```

Steps 1–3 are independent and can be built in parallel. Step 4 depends on Step 2.

