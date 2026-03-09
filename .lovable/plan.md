

# End-to-End QA Pass — Marketing Pages Audit

## Issues Found

### 1. Missing `PublicFooter` on Public Pages
These public-route pages lack the shared footer, breaking navigation consistency:
- **Waitlist** (`/waitlist`) — has `Navigation` but no `PublicFooter`
- **Install** (`/install`) — has `Navigation` but no `PublicFooter`
- **Community** (`/community`) — no `Navigation`, no `PublicFooter`
- **Premieres** (`/premieres`) — uses `GlobalHeader` but no `PublicFooter`
- **LivePage** (`/live`) — no `Navigation`, no `PublicFooter`
- **Achievements** (`/achievements`) — no `Navigation`, no `PublicFooter`
- **PrimeBeatForge** (`/beat-forge`) — needs audit (likely missing both)
- **EconomyPublic** (`/economy`) — has `PublicFooter` but no top `Navigation`

### 2. Missing `SEOHead` Component
These pages use raw `<Helmet>` instead of the standardized `SEOHead` component:
- **Community** — raw Helmet
- **Install** — raw Helmet
- **EconomyPublic** — raw Helmet
- **LivePage** — no SEO meta at all
- **MixClubHome** — raw Helmet

### 3. Missing Top Navigation on Public Pages
Several public pages have no way to navigate back without browser back button:
- **Community**, **LivePage**, **Achievements**, **EconomyPublic**

### 4. Inconsistent `Navigation` Usage
Some pages use `Navigation` (desktop nav bar), others use `GlobalHeader`, and some have nothing. Public marketing pages should consistently use `Navigation`.

## Fix Plan

### File: `src/pages/EconomyPublic.tsx`
- Replace raw `<Helmet>` with `<SEOHead>`
- Add `Navigation` import and render above content

### File: `src/pages/Waitlist.tsx`
- Add `<PublicFooter />` at end of content

### File: `src/pages/Install.tsx`
- Replace raw `<Helmet>` with `<SEOHead>`
- Add `<PublicFooter />` at end of content

### File: `src/pages/Community.tsx`
- Replace raw `<Helmet>` with `<SEOHead>`
- Add `Navigation` at top
- Add `<PublicFooter />` at end

### File: `src/pages/Premieres.tsx`
- Add `<PublicFooter />` at end

### File: `src/pages/LivePage.tsx`
- Add `<SEOHead>` with proper title/description
- Add `Navigation` at top
- Add `<PublicFooter />` at end

### File: `src/pages/Achievements.tsx`
- Add `Navigation` at top
- Add `<PublicFooter />` at end

### File: `src/pages/PrimeBeatForge.tsx`
- Audit and add `Navigation` + `PublicFooter` if missing

**Total: ~8 files edited.** Each change is small — import + render 1-2 components. No layout restructuring needed.

