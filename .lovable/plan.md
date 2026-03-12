

# Phase 10 Sprint 2: SEO & Performance Optimization

## Current State

**SEO strengths already in place:**
- `SEOHead` component with JSON-LD, canonical URLs, Open Graph, and Twitter cards used across 25 pages
- `robots.txt` exists but is minimal (no sitemap reference, no disallow for auth/admin routes)
- Sitemap exists only as a client-side download — invisible to crawlers
- Structured data (Organization, WebSite, Product schemas) embedded via SEOHead

**SEO gaps:**
- ~80+ pages exist but only 25 use SEOHead — protected routes are fine without it, but pages like `HowItWorks`, `Waitlist`, `Achievements`, `Community` (public route) are missing meta tags
- `robots.txt` has no `Sitemap:` directive and doesn't block `/admin`, `/dashboard`, `/settings`, `/checkout`
- Sitemap is a React component that downloads XML — crawlers can't access it. Needs to be a static `public/sitemap.xml` file
- No `og-default.jpg` exists in `/public` (referenced by SEOHead as fallback)
- `index.html` has hardcoded OG tags that conflict with Helmet-injected tags on subpages

**Performance gaps:**
- 20+ public pages are statically imported in `publicRoutes.tsx` (Auth, FAQ, Terms, Privacy, Pricing, Contact, About, Press, ForArtists, ForEngineers, ForProducers, ForFans, etc.) — these should be lazy-loaded since only the landing page is critical
- `vite.config.ts` manual chunks are good but `framer-motion` (heavy) is not split out
- No `font-display: swap` on Google Fonts link
- No preload hints for critical assets
- `SplashScreen` runs on every visit including returning users

## Implementation Plan

### Task 1: Static sitemap.xml + robots.txt update
Create `public/sitemap.xml` with all 20+ public routes. Update `robots.txt` to reference sitemap and disallow admin/auth/dashboard paths. Delete the `Sitemap.tsx` page component and its route.

### Task 2: Lazy-load remaining public pages
Convert 15+ static imports in `publicRoutes.tsx` to `React.lazy()`: Auth, FAQ, Terms, Privacy, Pricing, Contact, About, Press, ForArtists, ForEngineers, ForProducers, ForFans, Waitlist, HowItWorks, Install, etc. Keep only `MixClubHome` as static (critical landing page). Wrap each in `React.Suspense`.

### Task 3: Add SEOHead to missing public pages
Add SEOHead to `HowItWorks`, `Waitlist`, `Achievements`, `Premieres`, `Community` (public route), `BeatMarketplace`, `Services`, `ChoosePath`, `QuickStart`. These are crawlable public pages currently missing meta tags.

### Task 4: Fix index.html duplicate meta tags
Remove hardcoded `og:title`, `og:description`, `twitter:title`, `twitter:description` from `index.html` — these conflict with Helmet. Keep only the fallback `og:image` and `twitter:image`.

### Task 5: Performance quick wins
- Add `&display=swap` to Google Fonts URL in `index.html`
- Add `<link rel="preload">` for critical font files
- Split `framer-motion` into its own manual chunk in `vite.config.ts`
- Create a placeholder `public/og-default.jpg` (or point to an existing asset)

### Task 6: Clean up Sitemap route
Remove `Sitemap` lazy import and route from `appRoutes.tsx`. The static file replaces it.

## File Impact
- **Create**: `public/sitemap.xml`
- **Edit**: `public/robots.txt`, `index.html`
- **Edit**: `src/routes/publicRoutes.tsx` (lazy loading)
- **Edit**: `src/routes/appRoutes.tsx` (remove sitemap route)
- **Edit**: `vite.config.ts` (framer-motion chunk)
- **Edit**: ~8 page files (add SEOHead)
- **Delete**: `src/pages/Sitemap.tsx`

