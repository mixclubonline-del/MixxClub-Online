# Page Registry

> Last updated: 2026-01-07

This document tracks all pages in the Mixx Club application, their status, and phase targets.

## Status Legend

| Status | Description |
|--------|-------------|
| ✅ Active | Fully functional and in production |
| 🚧 Stub | Coming soon placeholder with notification signup |
| 🔒 Feature-Flagged | Behind feature flag, unlocks at milestone |
| ➡️ Redirect | Redirects to another route |

---

## Public Routes (`publicRoutes.tsx`)

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/` | InsiderDemo | ✅ Active | Main landing page |
| `/mixclub` | MixClubHome | ✅ Active | Alternative home |
| `/launch` | InsiderDemo | ✅ Active | Launch redirect |
| `/home` | MixClubHome | ✅ Active | Home alias |
| `/install` | Install | ✅ Active | PWA install instructions |
| `/network` | - | ➡️ Redirect | → `/` |
| `/artist` | Artist | ✅ Active | Artist info page |
| `/engineer` | Engineer | ✅ Active | Engineer info page |
| `/auth` | Auth | ✅ Active | Authentication |
| `/auth/callback` | AuthCallback | ✅ Active | OAuth callback |
| `/demo` | DemoLogin | ✅ Active | Demo access |
| `/insider-demo` | InsiderDemo | ✅ Active | Insider preview |
| `/how-it-works` | HowItWorks | ✅ Active | Platform explainer |
| `/showcase` | Showcase | ✅ Active | Work showcase |
| `/for-artists` | ForArtists | ✅ Active | Artist benefits |
| `/for-engineers` | ForEngineers | ✅ Active | Engineer benefits |
| `/faq` | FAQ | ✅ Active | FAQ page |
| `/terms` | Terms | ✅ Active | Terms of service |
| `/privacy` | Privacy | ✅ Active | Privacy policy |
| `/pricing` | Pricing | ✅ Active | Pricing plans |
| `/contact` | Contact | ✅ Active | Contact form |
| `/about` | About | ✅ Active | About page |
| `/waitlist` | Waitlist | ✅ Active | Waitlist signup |
| `/press` | Press | ✅ Active | Press kit |
| `/enterprise` | Enterprise | ✅ Active | Enterprise info |

---

## App Routes (`appRoutes.tsx`)

### Dashboard & CRM

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/dashboard` | Dashboard | ✅ Active | Main dashboard |
| `/artist-dashboard` | - | ➡️ Redirect | → `/artist-crm` |
| `/engineer-dashboard` | - | ➡️ Redirect | → `/engineer-crm` |
| `/artist-crm` | ArtistCRM | ✅ Active | Artist CRM |
| `/engineer-crm` | EngineerCRM | ✅ Active | Engineer CRM |

### Sessions & Collaboration

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/sessions` | SessionsBrowser | ✅ Active | Session browser |
| `/create-session` | CreateSession | ✅ Active | New session |
| `/session/:sessionId` | SessionDetail | ✅ Active | Session view |
| `/collaborate/:sessionId` | CollaborativeWorkspace | ✅ Active | Collab workspace |
| `/hybrid-daw` | HybridDAW | ✅ Active | DAW interface |

### Community

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/community` | Community | ✅ Active | Main community hub |
| `/crowd` | Crowd | ✅ Active | Crowd features |
| `/premieres` | Premieres | ✅ Active | Track premieres |
| `/leaderboard` | CommunityLeaderboard | ✅ Active | Rankings |
| `/achievements` | Achievements | ✅ Active | User achievements |
| `/unlockables` | UnlockablesHub | ✅ Active | Unlockable features |

### Legacy Redirects

| Path | Status | Target |
|------|--------|--------|
| `/pulse` | ➡️ Redirect | `/community?tab=feed` |
| `/arena` | ➡️ Redirect | `/community?tab=arena` |
| `/feed` | ➡️ Redirect | `/community?tab=feed` |
| `/mix-battles` | ➡️ Redirect | `/community?tab=arena` |
| `/mixing` | ➡️ Redirect | `/services/mixing` |
| `/mastering` | ➡️ Redirect | `/services/mastering` |
| `/ai-mastering` | ➡️ Redirect | `/services/ai-mastering` |
| `/distribution` | ➡️ Redirect | `/services/distribution` |

### Services

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/services` | Services | ✅ Active | Service overview |
| `/services/mixing` | MixingShowcase | ✅ Active | Mixing service |
| `/services/mastering` | MasteringShowcase | ✅ Active | Mastering service |
| `/services/ai-mastering` | AIMastering | ✅ Active | AI mastering |
| `/services/distribution` | DistributionHub | ✅ Active | Distribution |

### Engineers

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/engineers` | EngineerDirectory | ✅ Active | Engineer directory |
| `/engineer/:userId` | EngineerProfile | 🚧 Stub | Phase 3 |

### Tools & Features

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/upload` | AudioUpload | ✅ Active | Audio upload |
| `/audio-lab` | AudioLab | ✅ Active | Audio lab |
| `/suno-test` | SunoTest | ✅ Active | Suno integration test |
| `/brand-forge` | BrandForge | ✅ Active | Brand assets |
| `/prime-beat-forge` | PrimeBeatForge | ✅ Active | Beat generation |
| `/prime-marketing` | PrimeMarketingCopy | ✅ Active | Marketing copy |
| `/jobs` | JobBoard | ✅ Active | Job listings |
| `/messaging-test` | MessagingTest | ✅ Active | Messaging test |

### Live Streaming

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/live` | LivePage | ✅ Active | Live streams |
| `/watch/:streamId` | WatchStreamPage | ✅ Active | Watch stream |
| `/broadcast/:streamId` | BroadcastPage | ✅ Active | Go live |

### Onboarding

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/onboarding/artist` | ArtistOnboarding | ✅ Active | Artist onboarding |
| `/onboarding/engineer` | EngineerOnboarding | ✅ Active | Engineer onboarding |
| `/onboarding/hybrid` | HybridOnboarding | ✅ Active | Hybrid onboarding |

### Commerce

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/checkout` | Checkout | ✅ Active | Checkout flow |
| `/order-success/:paymentId` | OrderSuccess | ✅ Active | Order confirmation |
| `/payment-canceled` | PaymentCanceled | ✅ Active | Payment canceled |

### Settings

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/settings` | Settings | ✅ Active | User settings |
| `/notification-preferences` | NotificationPreferences | ✅ Active | Notification settings |
| `/search` | Search | ✅ Active | Global search |
| `/notifications` | Notifications | ✅ Active | Notifications |

### Feature-Flagged Pages

| Path | Component | Status | Feature Flag | Unlock |
|------|-----------|--------|--------------|--------|
| `/marketplace` | Marketplace | 🔒 Feature-Flagged | `MARKETPLACE` | 500 community members |
| `/label-services` | LabelServices | 🔒 Feature-Flagged | `LABEL_SERVICES` | 100 completed projects |
| `/ai-audio-intelligence` | AIAudioIntelligence | 🔒 Feature-Flagged | `AI_AUDIO` | 1000 community members |

### Stub Pages (Phase 3)

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/engineer/:userId` | EngineerProfile | 🚧 Stub | Full profiles |
| `/my-certifications` | MyCertifications | 🚧 Stub | Certification system |
| `/integrations` | Integrations | 🚧 Stub | Third-party integrations |
| `/battle-tournaments` | ComingSoon | 🚧 Stub | Tournament system |

### Utility Pages

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/freemium` | FreemiumOverview | ✅ Active | Plan comparison |
| `/matching` | MatchingDashboard | ✅ Active | AI matching demo |
| `/sitemap` | Sitemap | ✅ Active | XML sitemap generator |
| `/coming-soon` | ComingSoon | ✅ Active | Generic coming soon |

### Merch Store

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/merch` | MerchStore | ✅ Active | Merch store |
| `/merch/:username` | ArtistStorefront | ✅ Active | Artist store |
| `/store/:username` | ArtistStorefront | ✅ Active | Store alias |
| `/artist/merch-manager` | ArtistMerchManager | ✅ Active | Manage merch |

### Public Profiles

| Path | Component | Status | Notes |
|------|-----------|--------|-------|
| `/u/:username` | PublicProfile | ✅ Active | Public profile |

---

## Mobile Routes (`mobileRoutes.tsx`)

Mobile-optimized versions of core app pages.

---

## City Routes (`cityRoutes.tsx`)

Location-based pages for city hubs.

---

## Deleted Pages (Cleanup 2026-01-07)

These files were removed as they had redirects in place:

- `Arena.tsx` → `/community?tab=arena`
- `Feed.tsx` → `/community?tab=feed`
- `Pulse.tsx` → `/community?tab=feed`
- `MixBattles.tsx` → `/community?tab=arena`
- `Mixing.tsx` → `/services/mixing`
- `Mastering.tsx` → `/services/mastering`
- `ArtistDashboard.tsx` → `/artist-crm`
- `EngineerDashboard.tsx` → `/engineer-crm`
- `Network.tsx` → `/`
- `HomeSimple.tsx` (unused alternative)
- `IntroScene.tsx` (unused intro)
- `MarketplaceHub.tsx` (duplicate of Marketplace.tsx)

---

## Phase Roadmap

### Phase 3 (Current Focus)
- Engineer full profiles with portfolios
- Certification system
- Third-party integrations
- Session workspace enhancements

### Phase 4 (Planned)
- Tournament brackets
- Advanced AI features
- Label services expansion
