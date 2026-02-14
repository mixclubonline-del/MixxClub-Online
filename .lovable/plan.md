

## Fix Sitemap: Correct Domain, Add Missing Routes, Remove Internal Pages

### Problems

1. **Wrong domain** -- Both `Sitemap.tsx` and `public/sitemap.xml` use `https://mixclub.com` instead of `https://mixxclub.lovable.app`
2. **Missing public routes** -- `/for-artists`, `/for-engineers`, `/for-producers`, `/for-fans`, `/how-it-works`, `/press`, `/faq`, `/choose-path`, `/install` are not listed
3. **Internal/auth routes included** -- `/dashboard`, `/artist-crm`, `/engineer-crm`, `/marketplace`, `/collaboration`, `/education`, `/battles` are behind auth and should not be in a public sitemap

### Changes

#### 1. `src/pages/Sitemap.tsx`

- Update `baseUrl` to `https://mixxclub.lovable.app`
- Replace the routes array with the correct public-only set:

| Route | Priority | Changefreq |
|-------|----------|------------|
| `/` | 1.0 | daily |
| `/pricing` | 0.9 | weekly |
| `/how-it-works` | 0.8 | weekly |
| `/showcase` | 0.8 | daily |
| `/for-artists` | 0.8 | monthly |
| `/for-engineers` | 0.8 | monthly |
| `/for-producers` | 0.8 | monthly |
| `/for-fans` | 0.8 | monthly |
| `/choose-path` | 0.7 | monthly |
| `/about` | 0.7 | monthly |
| `/contact` | 0.7 | monthly |
| `/press` | 0.7 | monthly |
| `/faq` | 0.6 | monthly |
| `/install` | 0.5 | monthly |
| `/privacy` | 0.4 | yearly |
| `/terms` | 0.4 | yearly |

Removed: `/dashboard`, `/artist-crm`, `/engineer-crm`, `/marketplace`, `/collaboration`, `/education`, `/battles`

#### 2. `public/sitemap.xml`

Same changes -- update domain and route list to match `Sitemap.tsx` so crawlers hitting the static file get the correct data. Set `lastmod` to `2026-02-14`.

### No new dependencies or backend changes required.
