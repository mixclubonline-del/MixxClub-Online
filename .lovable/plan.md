

## Stripe Connect Onboarding Wizard for Engineers

### What exists today
- `useStripeConnect` hook fetches account status from a `get-stripe-connect-status` edge function
- `StripeConnectCard` component shows connect/pending/active/restricted states as a single card
- `setup-stripe-connect` edge function creates Stripe Express accounts and returns an onboarding link
- The card is embedded in the Engineer CRM dashboard and payment tabs

### What we'll build
A full-page wizard component (`StripeConnectWizard`) that replaces the simple card with a guided, multi-step experience showing engineers exactly where they are in the payout setup process.

### New component: `src/components/engineer/StripeConnectWizard.tsx`

A wizard with 4 visual steps using the existing `ProgressIndicator` component:

1. **Welcome / Why Connect** — explains 70% revenue share, weekly payouts, security. CTA to start.
2. **Stripe Setup** — triggers `startOnboarding()` which redirects to Stripe's hosted onboarding. Shows "You'll be redirected to Stripe" messaging.
3. **Verification** — shown after returning from Stripe (`?setup=complete`). Polls `refreshStatus()` and displays real-time verification status from `status.requirements` (currently_due, pending_verification).
4. **All Set** — shown when `canReceivePayouts` is true. Confirms bank last4, shows "Payouts Enabled" badge, CTA to go to dashboard.

Step status is derived from `useStripeConnect`:
- Not connected → Step 1 active
- Connected but `!detailsSubmitted` → Step 2 active
- Connected, submitted, but `hasRequirements` or `pending_verification` → Step 3 active
- `canReceivePayouts` → Step 4 complete

### Changes

**1. Create `src/components/engineer/StripeConnectWizard.tsx`**
- Uses `useStripeConnect` hook for all state
- Renders step indicators via the existing `ProgressIndicator` component
- Each step panel shows contextual content based on account status
- Auto-advances steps when status changes (e.g., after returning from Stripe redirect)
- Includes a "Refresh Status" button for verification polling

**2. Update `src/components/crm/EngineerCRMDashboard.tsx`**
- When `!canReceivePayouts && !stripeLoading`, render the new `StripeConnectWizard` as a prominent section instead of the compact `StripeConnectCard`
- Keep `StripeConnectCard` in the payment tab for quick-glance status

**3. Update `src/components/crm/revenue/PaymentIntegration.tsx`**
- Add the wizard as a full-width section above the tabs when not connected, replacing the existing `StripeConnectCard` in the overview tab for unconnected users

No database or edge function changes needed — all data comes from the existing `useStripeConnect` hook and edge functions.

