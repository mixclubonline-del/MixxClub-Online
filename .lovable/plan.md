

## MixxClub Site Navigation Flow Walkthrough + Missed Opportunities

---

### The Full User Journey (as it exists today)

```text
VISITOR (unauthenticated)
  |
  / (Home) --> SceneFlow controller
  |   |-- HALLWAY scene (atmospheric, wordless studio door visualization)
  |   |-- DEMO scene (InsiderDemoExperience - product demo)
  |   |-- INFO scene (ClubScene - room-by-room tour: Listening, Vault, Green, Control, VIP, Stage)
  |
  +-- /choose-path --> Cinematic role selector (Producer / Artist / Engineer / Fan)
  |     |-- links to /for-producers, /for-artists, /for-engineers, /for-fans
  |
  +-- /how-it-works --> Journey showcase (Artist path + Engineer path)
  +-- /for-artists, /for-engineers, /for-producers, /for-fans --> Role landing pages
  +-- /showcase, /pricing, /faq, /about, /press, /enterprise
  +-- /waitlist
  |
  +-- /auth --> Magic Link signup/login
        |
        v
AUTHENTICATED USER
  |
  +-- /select-role --> Role Selection Gateway (keyboard 1-4)
  |     v
  +-- /onboarding/{role} --> Role-specific onboarding wizard
  |     v
  +-- CRM Hub (role-dependent):
  |     /artist-crm   (sidebar + header via ProtectedAppLayout)
  |     /engineer-crm
  |     /producer-crm
  |     /fan-hub
  |     /admin
  |
  +-- Sidebar navigation (desktop) --> role-filtered categories
  |     Main | CRM | Services | Opportunities | Shop | Economy | Discover | Account
  |
  +-- MobileBottomNav (phone) --> 5 tabs, role-specific
  +-- TabletSideNav (tablet)
  +-- MobileEnhancedNav (phone, used by AppLayout for phone deviceType)
  |
  +-- /city/* --> MixClub City district system (9 districts)
  +-- /live, /sessions, /community, /economy, /beats, /merch, etc.
```

---

### Missed Opportunities

#### 1. HOME PAGE HAS NO VISIBLE NAVIGATION FOR VISITORS

**The problem:** When a visitor lands on `/`, the SceneFlow takes over the entire viewport. The `Navigation` component is NOT rendered on the home page -- it was removed in the last fix (the redirect removal also removed the `<Navigation />` import). The `MixClubHome` component now only renders `<PrimeLanding />`, which is just `<SceneFlow />`.

**Impact:** First-time visitors see an atmospheric hallway with no menu, no header, and no clear way to reach `/how-it-works`, `/pricing`, `/for-artists`, etc. They must discover keyboard shortcuts (Enter, I, Escape) or hope for on-screen affordances inside the scene.

**Fix:** Add a floating or overlay Navigation bar to the home page, or ensure SceneFlow surfaces clear CTAs to critical pages (Pricing, For Artists, How It Works, Auth).

---

#### 2. PUBLIC PAGES HAVE NAVIGATION, BUT NO CROSS-LINKING TO EACH OTHER

Pages like `/how-it-works`, `/for-artists`, `/for-engineers`, `/pricing`, `/about` each render `<Navigation />` at the top. However, these pages do not consistently link to each other. For example:
- `/how-it-works` does not link to `/pricing`
- `/for-artists` does not link to `/for-engineers` or `/for-producers`
- None of these pages link back to `/choose-path` as a "not sure which role?" escape hatch

**Fix:** Add a consistent footer or secondary nav on all public pages with links to: How It Works, Pricing, Choose Path, and all four role pages.

---

#### 3. PRODUCER AND FAN ROLES MISSING FROM MobileBottomNav

`MobileBottomNav` only defines tab sets for `engineer`, `admin`, and a default (artist). Producers and fans get the artist tabs, which point to `/artist-crm` and `/engineers` -- wrong destinations for those roles.

**Fix:** Add dedicated tab configurations for `producer` (Home -> /producer-crm, Beats -> /beats, Create -> /prime-beat-forge, Sessions, Alerts) and `fan` (Feed -> /fan-hub, Discover -> /community, Live -> /live, Beats -> /beats, Alerts).

---

#### 4. MobileEnhancedNav DETECTS ROLE BY URL, NOT BY AUTH STATE

`MobileEnhancedNav` uses `location.pathname.includes('engineer')` to determine role instead of `useAuth().userRole`. A producer browsing `/community` gets artist tabs. An engineer on `/settings` gets artist tabs.

**Fix:** Use `userRole` from auth context instead of URL sniffing.

---

#### 5. DUPLICATE NAVIGATION SYSTEMS (MobileBottomNav vs MobileEnhancedNav)

Two separate mobile nav components exist:
- `MobileBottomNav` (rendered by `GlobalNavigation` in App.tsx for `isPhone`)
- `MobileEnhancedNav` (rendered by `AppLayout` when `deviceType === 'phone'`)

Both render on phone simultaneously for protected routes, creating potential double-nav or conflicting navigation.

**Fix:** Consolidate into one system. `MobileEnhancedNav` (header + bottom nav) should be the single phone nav, with `MobileBottomNav` removed or guarded to not render when AppLayout is active.

---

#### 6. CITY DISTRICTS ARE UNREACHABLE FROM MAIN NAVIGATION

The `/city/*` routes (9 districts: Tower, Studio, Creator, Prime, Analytics, Commerce, Broadcast, Arena) exist but are not linked from the sidebar, bottom nav, or any CRM page. The only entry point is `/city` (CityGates), which itself is not in any nav menu.

**Fix:** Add a "City" or "Explore" link in the sidebar and mobile nav that leads to `/city`. Alternatively, integrate district links into the relevant CRM sections (e.g., Commerce District link in Economy section).

---

#### 7. NO GLOBAL "BACK TO HOME" OR "EXPLORE" ESCAPE FOR AUTHENTICATED USERS

After the redirect removal fix, authenticated users CAN now see the home page at `/`. But the sidebar logo links directly to the CRM (role-dependent), and there is no "Home" or "Explore" link that takes users to the public-facing site or the City. Authenticated users are effectively locked into CRM + sidebar routes.

**Fix:** Add an "Explore" or "City" entry to the sidebar navigation config, or make the logo link configurable (long-press for home, click for CRM).

---

#### 8. /how-it-works AND /showcase HAVE NO AUTH CTA

These pages show the product value proposition but lack a clear "Sign Up" or "Get Started" button that links to `/auth?mode=signup` or `/choose-path`. The journey ends at information with no conversion funnel.

**Fix:** Add a sticky CTA bar or prominent signup button at the bottom of these pages.

---

#### 9. SEVERAL PROTECTED PAGES RENDER THEIR OWN `<Navigation />` INSIDE `ProtectedAppLayout`

At least 15 pages (Dashboard, JobBoard, SessionDetail, ProjectDetail, etc.) import and render `<Navigation />` themselves, even though they are already inside `ProtectedAppLayout` which provides `AppSidebar` + header. This creates a double navigation bar on desktop.

**Fix:** Remove the `<Navigation />` import from all pages wrapped by `ProtectedAppLayout`. The layout already provides the sidebar and header.

---

#### 10. NO SITEMAP OR FOOTER ON PUBLIC PAGES

A `/sitemap` page exists but is behind auth (inside ProtectedAppLayout). Public visitors have no footer with links to Terms, Privacy, About, Contact, Press. These pages exist but are only discoverable via direct URL.

**Fix:** Create a shared `PublicFooter` component with links to legal pages, social media, and key public routes. Add it to all public page layouts.

---

### Priority Ranking

| Priority | Issue | Impact |
|----------|-------|--------|
| P0 | Home page has no navigation for visitors | First impression / conversion killer |
| P0 | Producer/Fan missing from MobileBottomNav | Broken mobile UX for 50% of roles |
| P1 | MobileEnhancedNav uses URL sniffing vs auth role | Wrong nav tabs when browsing |
| P1 | Duplicate mobile nav systems | Visual bugs, wasted renders |
| P1 | Double Navigation on protected pages | UI clutter on desktop |
| P2 | City districts unreachable from nav | Major feature invisible |
| P2 | No auth CTA on showcase/how-it-works pages | Lost conversions |
| P2 | No cross-linking between public pages | Dead-end browsing |
| P3 | Sitemap behind auth | SEO and discoverability |
| P3 | No public footer | Standard web UX missing |

