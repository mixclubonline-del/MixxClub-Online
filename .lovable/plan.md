

# Interactive Pricing Calculator

## What We're Building
A new section on the Pricing page — an interactive calculator widget where visitors can select a service type, pick a package, toggle add-ons, and optionally apply a MixxCoinz tier discount to see a live total estimate. This makes the pricing page more engaging and helps users understand the full cost before checkout.

## Component Design

### New: `src/components/pricing/PricingCalculator.tsx`
A self-contained calculator component placed on the Pricing page between the MixxCoinz callout and TrustBadges. Sections:

1. **Service Type Selector** — Radio buttons: Mixing / Mastering (distribution and beats have variable/external pricing, so excluded)
2. **Package Picker** — Dropdown or button group populated from `useMixingPackages()` / `useMasteringPackages()` based on selection. Shows base price.
3. **Add-On Toggles** — Checkbox list from `useAddonServices(serviceType)`. Each shows its price (or percentage resolved against the selected package price). Uses the existing `calculateAddonPrice` utility.
4. **MixxCoinz Tier Discount** — Dropdown simulating tier levels (Newcomer 0%, Supporter 3%, Advocate 5%, Champion 10%, Legend 15%). Applies discount to the total. Educational — shows visitors what they could save.
5. **Live Total Breakdown** — Animated price display:
   - Base package price
   - + Add-ons subtotal
   - − Tier discount
   - = **Estimated Total**
6. **CTA** — "Get Started" button navigating to checkout or signup

### Edit: `src/pages/Pricing.tsx`
Import and render `<PricingCalculator />` after the MixxCoinz callout banner (line ~574), wrapped in a `motion.div` with scroll reveal. Uses existing data hooks already loaded on the page — pass `mixingPackages`, `masteringPackages`, and `addons` as props to avoid duplicate queries.

## Technical Details
- Reuses `GlassPanel` for the calculator container
- Reuses `calculateAddonPrice` and `formatAddonPrice` from `useAddonServices`
- Tier discounts use the same constants as `useCoinzCheckout` (0/3/5/10/15%)
- All state is local (`useState`) — no database changes needed
- Framer Motion `AnimatePresence` for smooth total transitions

## Files Changed
1. **New:** `src/components/pricing/PricingCalculator.tsx`
2. **Edit:** `src/pages/Pricing.tsx` — import and render calculator

