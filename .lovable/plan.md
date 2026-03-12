

# SEO Super Optimization — Final Pass

## Audit Findings

### 1. Pages Missing SEOHead (using raw Helmet or nothing)
These public-facing pages lack the standardized SEOHead component, meaning they're missing canonical URLs, OG tags, Twitter cards, and structured data:
- **Showcase.tsx** — uses raw `<Helmet>` instead of SEOHead
- **MixingShowcase.tsx** — uses raw `<Helmet>`
- **MasteringShowcase.tsx** — uses raw `<Helmet>`
- **BattleTournaments.tsx** — uses raw `<Helmet>`
- **Enterprise.tsx** — no SEO tags at all
- **DistributionHub.tsx** — no SEO tags at all
- **NotFound.tsx** — no SEO tags (should have `noindex`)
- **DreamEngine.tsx** — no SEO tags
- **MerchStore.tsx** — no SEO tags

### 2. Sitemap Gaps
Public routes that exist but are missing from `sitemap.xml`:
- `/live` (LivePage)
- `/beat-forge` (PrimeBeatForge)
- `/how-it-works` (redirects to /home, fine to omit)
- `/services/distribution` (DistributionHub)

### 3. Accessibility (a11y) Issues
- **Navigation.tsx**: No `aria-label` on `<nav>`, no `aria-label` on mobile menu toggle button, no `aria-expanded` on mobile toggle, dropdown buttons missing `aria-haspopup` and `aria-expanded`
- **155 empty alt="" attributes** on decorative images — most are background/decorative (acceptable with `role="presentation"`), but some are content images that need real alt text (cover art, product images, user content)
- **No skip-to-content link** — keyboard users have to tab through the entire nav on every page

### 4. SEOHead Component Gaps
- `sameAs` array is empty in `ORG_SCHEMA` — social links should be populated
- Missing `hreflang` tag (single-language site, but explicit `<link rel="alternate" hreflang="en">` helps)

### 5. index.html Gaps
- `<html lang="en">` is set (good)
- OG title/description missing from static `index.html` head (only set dynamically via Helmet — crawlers that don't execute JS will see empty OG tags)

---

## Plan

### Task 1: Add SEOHead to all public pages missing it
Convert ~9 pages from raw Helmet (or none) to the standardized SEOHead component with proper title, description, keywords, canonical URL, and `noindex` where appropriate (NotFound, DreamEngine).

### Task 2: Update sitemap.xml
Add missing public routes: `/live`, `/beat-forge`, `/services/distribution`. Set appropriate priority and changefreq.

### Task 3: Navigation accessibility
- Add `aria-label="Main navigation"` to `<nav>`
- Add `aria-label="Toggle menu"`, `aria-expanded={isOpen}` to mobile menu button
- Add `aria-haspopup="true"` and `aria-expanded` to dropdown trigger buttons
- Add a skip-to-content link (`<a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>`) and corresponding `id="main-content"` on the main content area in App.tsx

### Task 4: Populate ORG_SCHEMA sameAs
Fill in the actual social media URLs in SEOHead.tsx `ORG_SCHEMA.sameAs` array (Instagram, Twitter/X, etc.) instead of leaving it empty.

### Task 5: Static fallback meta tags in index.html
Add `og:title` and `og:description` content

<lov-plan>

# SEO Super Optimization — Final Pass

## Audit Findings

### 1. Pages Missing SEOHead (using raw Helmet or nothing)
These public-facing pages lack the standardized SEOHead component, meaning they're missing canonical URLs, OG tags, Twitter cards, and structured data:
- **Showcase.tsx** — uses raw `<Helmet>` instead of SEOHead
- **MixingShowcase.tsx** — uses raw `<Helmet>`
- **MasteringShowcase.tsx** — uses raw `<Helmet>`
- **BattleTournaments.tsx** — uses raw `<Helmet>`
- **Enterprise.tsx** — no SEO tags at all
- **DistributionHub.tsx** — no SEO tags at all
- **NotFound.tsx** — no SEO tags (should have `noindex`)
- **DreamEngine.tsx** — no SEO tags
- **MerchStore.tsx** — no SEO tags

### 2. Sitemap Gaps
Public routes missing from `sitemap.xml`:
- `/live`
- `/beat-forge`
- `/services/distribution`

### 3. Accessibility (a11y) Issues
- **Navigation.tsx**: Zero `aria-label` attributes. No `aria-expanded` on mobile toggle. Dropdown buttons missing `aria-haspopup`.
- **155 empty `alt=""` on images** — most are decorative backgrounds (fine), but storefront product images, cover art, and drop banners need real alt text
- **No skip-to-content link** — keyboard users must tab through full nav on every page

### 4. SEOHead Component Gaps
- `sameAs` array is empty in `ORG_SCHEMA` — should have real social URLs
- Static `index.html` has empty `og:title` and `og:description` (crawlers that don't run JS see nothing)

---

## Plan

### Task 1: Add SEOHead to 9 public pages
Replace raw `<Helmet>` or add SEOHead to: Showcase, MixingShowcase, MasteringShowcase, BattleTournaments, Enterprise, DistributionHub, NotFound (`noindex`), DreamEngine (`noindex`), MerchStore. Each gets a unique title, description, and keywords.

### Task 2: Update sitemap.xml
Add `/live`, `/beat-forge`, `/services/distribution` with appropriate priority values.

### Task 3: Navigation accessibility hardening
- `aria-label="Main navigation"` on `<nav>`
- `aria-label="Toggle menu"` + `aria-expanded={isOpen}` on mobile hamburger button
- `aria-haspopup="true"` on dropdown trigger buttons
- Add a **skip-to-content link** as the first child of `<body>`/root: `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` and add `id="main-content"` to the main content wrapper in App.tsx

### Task 4: Populate ORG_SCHEMA social links
Fill `sameAs` in SEOHead.tsx with the real social URLs (Twitter, Instagram, Facebook from seo-schema.ts).

### Task 5: Static fallback meta in index.html
Add content values to the existing empty `og:title` and `og:description` meta tags so non-JS crawlers see real content.

### Task 6: Content image alt text
Update storefront/product components where `alt=""` is used on content images (cover art, merch images, drop banners) to use dynamic alt text from the data (e.g., `alt={product.name}` or `alt={release.title}`). Leave genuinely decorative backgrounds as `alt=""` with `role="presentation"`.

---

## Scope
- ~12 files modified
- No database changes
- No breaking changes — purely additive SEO and a11y attributes

