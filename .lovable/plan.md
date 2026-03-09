

# Phase 2 & 3: Content Synchronization + Navigation Enrichment

## What's Done
- Phase 1 complete: `/for-producers` and `/for-fans` routes added to `publicRoutes.tsx`
- `navigationConfig.ts` updated with Economy, Achievements, Premieres, Certifications, Integrations, Beat Forge, AI Studio
- About page rewritten for four-role ecosystem

## What Remains

---

### Phase 2A: Pricing Page — Add Distribution & Economy Tabs

**File:** `src/pages/Pricing.tsx` (399 lines)

Currently 3 tabs: Creator Plans, Mixing, Mastering. Changes:

1. **Expand TabsList from 3 to 5 columns** — add "Distribution" and "Beat Licensing" tabs
2. **Distribution tab** — pulls from `useDistributionPackages()` hook (already built), renders distribution partner packages in GlassPanel cards matching the existing mixing/mastering card pattern
3. **Beat Licensing tab** — static pricing grid showing Lease / Premium / Exclusive tiers with price ranges (matches what ForProducers page describes)
4. **MixxCoinz callout banner** — add a GlassPanel below the tabs explaining that all purchases earn MixxCoinz and tier discounts apply, with link to `/economy`
5. **Update SEO meta** — expand keywords to include distribution and beat licensing

### Phase 2B: ForArtists Page — Add Economy & Premieres Sections

**File:** `src/pages/ForArtists.tsx` (289 lines)

Currently has journey steps + CRM features. Add:

1. **New CRM feature card: "MixxCoinz Rewards"** — icon: Coins, description about earning coinz through engagement, spending on services, tier discounts
2. **New CRM feature card: "Premieres & First Listens"** — icon: Star, description about exclusive early access to track premieres, fan backing
3. **Update "Community & Achievements" card** — expand techDetails to include "MixxCoinz Economy", "Premieres"
4. **Update hero subtitle** — mention "earn rewards" alongside mixing/mastering

### Phase 2C: ForEngineers Page — Add Certifications, Reviews, Integrations

**File:** `src/pages/ForEngineers.tsx` (214 lines)

Currently has business features. Add:

1. **New business feature card: "Verified Certifications"** — icon: Award, description about industry-recognized certifications, skill badges, client trust signals
2. **New business feature card: "DAW & Platform Integrations"** — icon: Compass, description about connecting to Pro Tools, Logic, Ableton, streaming platforms
3. **Update "Growth Academy" card** — expand to reference the actual `/my-certifications` route and verified reviews system
4. **Update hero subtitle** — mention certifications and integrations

### Phase 2D: ForProducers Page — Verify Economy References

**File:** `src/pages/ForProducers.tsx` (279 lines)

Content is solid but missing explicit MixxCoinz mentions:

1. **Add CRM feature: "MixxCoinz Earnings"** — icon: Coins, earning coinz from beat sales, spending on promotion, tier benefits
2. **Update "Producer Leaderboard" card** — add "MixxCoinz Rewards" to techDetails

### Phase 2E: ForFans Page — Verify Day 1 & Economy References

**File:** `src/pages/ForFans.tsx` (280 lines)

Content references Day 1 status and rewards well. Minor additions:

1. **Update "Earn Rewards" journey step** — explicitly mention MixxCoinz as the reward currency
2. **Add CRM feature: "MixxCoinz Wallet"** — icon: Coins, earning through streams/shares/referrals, spending on merch and exclusive content

### Phase 2F: Footer Enhancement

**File:** `src/components/layouts/PublicFooter.tsx`

1. **Add "Economy" link** to Platform section pointing to `/economy`
2. **Add "Marketplace" link** to Platform section pointing to `/marketplace`

---

### Phase 3: Already Complete

The navigation enrichment (logged-in role menus) was completed in the previous implementation pass. `navigationConfig.ts` already has:
- Artist: Economy, Achievements, Premieres, AI Studio
- Engineer: Certifications, Integrations, AI Studio  
- Producer: Economy, Achievements, Beat Forge
- Fan: Economy, Achievements, Premieres

No further Phase 3 changes needed.

---

## Implementation Order

1. `Pricing.tsx` — add Distribution + Beat Licensing tabs, MixxCoinz callout
2. `ForArtists.tsx` — add MixxCoinz + Premieres CRM cards
3. `ForEngineers.tsx` — add Certifications + Integrations cards
4. `ForProducers.tsx` — add MixxCoinz CRM card
5. `ForFans.tsx` — add MixxCoinz wallet card, update rewards step
6. `PublicFooter.tsx` — add Economy + Marketplace links

All changes follow existing component patterns (ShowcaseFeature, GlassPanel, motion animations). No new dependencies or database changes required.

