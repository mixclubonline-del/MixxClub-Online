

## AEO (Answer Engine Optimization) for Mixxclub

### Goal
Make Mixxclub's pages machine-readable and authoritative for AI search engines (ChatGPT, Perplexity, Google AI Overviews) so the platform surfaces as a direct answer when users ask about audio mixing services, beat marketplaces, or music engineering platforms.

### Current State
- `SEOHead` component injects Organization + WebSite JSON-LD on every page
- `seo-schema.ts` has generators for Product, Review, Breadcrumb, Service — but most are **unused** on actual pages
- `robots.txt` allows all major crawlers but doesn't address AI bots (GPTBot, PerplexityBot, ClaudeBot)
- No FAQ schema on any page
- No `speakable` markup
- Services pages have no Service schema despite the generator existing
- Beat/marketplace pages have no Product schema

### Plan

**1. Update `robots.txt` — Allow AI crawlers explicitly**
- Add `User-agent` rules for GPTBot, PerplexityBot, ClaudeBot, Google-Extended
- Keep existing disallow rules for private routes

**2. Enhance `SEOHead.tsx` — Add FAQ and Speakable schema support**
- Add optional `faq` prop: `Array<{question: string, answer: string}>`
- Auto-generates FAQPage JSON-LD when provided
- Add optional `speakable` prop for voice-search optimization

**3. Add FAQ sections with schema to key pages**
- **Services** (`/services`): "What is professional mixing?", "How much does mastering cost?", pricing questions
- **About** (`/about`): "What is Mixxclub?", "How does AI mixing work?"
- **How It Works** (`/how-it-works`): Process-oriented FAQs
- **Pricing** (`/pricing`): Plan comparison questions
- Create a reusable `FAQSection` component that renders visible FAQ accordion + passes data to SEOHead

**4. Wire existing schema generators to pages**
- Services page: inject `serviceSchema` for each service (Mixing, Mastering, AI Mastering, Distribution)
- Beat marketplace: inject `generateProductSchema` for beat listings
- About page: already uses `organizationSchema` — add `SoftwareApplication` schema for the platform itself

**5. Add `llms.txt` to `public/`**
- A plain-text file (emerging standard) that tells AI crawlers what Mixxclub is, key pages, and how to cite it
- Includes: platform description, service list, key URLs, contact info

**6. Create a `SpeakableSnippet` component**
- Wraps key text blocks (hero headlines, service descriptions) with `data-speakable` attributes
- Adds `speakable` schema pointing to CSS selectors for voice-assistant extraction

### Files Changed
- `public/robots.txt` — add AI bot rules
- `public/llms.txt` — new file
- `src/components/SEOHead.tsx` — add `faq` and `speakable` props
- `src/components/seo/FAQSection.tsx` — new reusable FAQ accordion with schema
- `src/pages/Services.tsx` — add FAQ + Service schemas
- `src/pages/About.tsx` — add FAQ + SoftwareApplication schema
- `src/pages/HowItWorks.tsx` — add FAQ
- `src/pages/Pricing.tsx` — add FAQ
- `src/lib/seo-schema.ts` — add FAQ, SoftwareApplication, and Speakable generators

No database changes needed.

