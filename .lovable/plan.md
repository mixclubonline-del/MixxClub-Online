

# Feature Visibility Audit — What's Built But Not Shown

## The Gap Analysis

Here's the unfiltered truth: we've built a massive amount of functionality that the public-facing site doesn't reflect. The site still tells a "mixing and mastering for artists and engineers" story, when the platform is actually a four-role ecosystem with an economy, certifications, premieres, integrations, and more.

---

## Built Features NOT Surfaced Anywhere Public

| Feature | Route | Status | Where It Should Appear |
|---------|-------|--------|----------------------|
| **MixxCoinz Economy** | `/economy` | Fully built | Navigation, Pricing, About, How It Works, For Artists/Engineers |
| **For Producers** page | `/for-producers` | Fully built | **Not in publicRoutes.tsx at all** — 404 for visitors |
| **For Fans** page | `/for-fans` | Fully built | **Not in publicRoutes.tsx at all** — 404 for visitors |
| **Certifications** | `/my-certifications` | Fully built | Navigation (logged-in), For Engineers, Pricing |
| **Premieres** | `/premieres` | Fully built | Navigation (logged-in), For Fans, For Artists |
| **Integrations** | `/integrations` | Fully built | Navigation (logged-in), For Engineers |
| **AI Audio Intelligence** | `/ai-audio-intelligence` | Fully built | Showcase, For Engineers, For Artists |
| **Beat Forge** | `/beat-forge` | Fully built, public route exists | Navigation for producers missing link |
| **Achievements/Unlockables** | `/achievements`, `/unlockables` | Fully built | Navigation, community sections |
| **Live Sessions** | `/live` | Fully built | For Fans, For Artists — not prominently featured |
| **Engineer Reviews** | In-component | Fully built | For Engineers page doesn't mention verified reviews system |
| **Effect Presets / Studio Sessions** | In-DAW | Fully built | Showcase page should highlight cloud sync |
| **Add-On Services** | In checkout | Fully built | Pricing page doesn't showcase add-on system |
| **Distribution Hub** | `/services/distribution` | Fully built | Pricing page missing "Distribution" tab |

---

## Navigation Gaps

**Public nav (logged out):** No mention of MixxCoinz, Producers, Fans, Certifications, Premieres, or Economy.

**Footer:** Links to `/for-producers` and `/for-fans` which are **404s** (missing from `publicRoutes.tsx`).

**Logged-in nav:** No links to Economy, Certifications, Integrations, Achievements, or Unlockables for any role.

---

## Pages That Need Content Updates

### About Page
- Still tells an "artists + engineers" story — missing Producers and Fans entirely
- "Founded in 2024" — needs update to reflect the four-role ecosystem, MixxCoinz economy, AI tools
- Stats are generic (10K artists, 500 engineers) — should include producers, fans, and economy metrics

### Pricing Page
- Only 3 tabs: Creator Plans, Mixing, Mastering
- Missing: Distribution pricing, Beat Marketplace fees, Producer licensing tiers, MixxCoinz packages
- No mention of the economy system or how MixxCoinz integrate with pricing

### For Artists Page
- No mention of MixxCoinz rewards, achievements, premieres, or the fan backing system
- CRM features section doesn't reference Economy dashboard or Distribution

### For Engineers Page
- No mention of certifications system, engineer reviews, or integrations
- Growth coaching section mentions certifications in stats but doesn't link to the actual feature

### How It Works Page
- Community Showcase covers MixxCoinz, Unlockables, Battles, Merch, Learning, Live Sessions
- But the role journeys don't mention Economy, Certifications, or Premieres in their steps

---

## The Fix Plan (3 Phases)

### Phase 1: Routing & Navigation Fixes (30 min)
1. **Add `/for-producers` and `/for-fans` to `publicRoutes.tsx`** — currently 404
2. **Update Navigation.tsx** — add Economy, Certifications, Achievements links to logged-in role menus
3. **Update PublicFooter.tsx** — verify all "For Creatives" links resolve

### Phase 2: Content Updates Across Pages (2-3 hours)
1. **About Page** — rewrite to reflect the four-role ecosystem, MixxCoinz economy, AI studio tools, and community unlock system
2. **Pricing Page** — add Distribution tab and Beat Marketplace fee breakdown; add MixxCoinz info callout
3. **For Artists Page** — add MixxCoinz rewards section, premieres feature, fan backing system
4. **For Engineers Page** — add certifications showcase, engineer reviews system, integrations preview
5. **For Producers Page** — verify it references Beat Forge, licensing engine, and royalty tracking
6. **For Fans Page** — verify it references Day 1 status, MixxCoinz earning, and premieres

### Phase 3: Navigation Enrichment (1 hour)
1. **Logged-in artist nav** — add Economy, Achievements under a "Rewards" dropdown
2. **Logged-in engineer nav** — add Certifications, Integrations under "Growth" dropdown
3. **Logged-in producer nav** — add Economy link
4. **Logged-in fan nav** — add Premieres, Achievements under "Discover"
5. **Public nav (logged out)** — add "Economy" or "Rewards" teaser link pointing to How It Works community section

This brings the site's storytelling in line with what's actually built — every feature visible, every role represented, every surface intentional.

