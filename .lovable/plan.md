

# Route Rename & Navigation Restructure (Updated)

## Summary

Same plan as previously approved, with one addition: the **Platform** dropdown now includes **MixxCoinz** (`/economy`).

## Route Changes

| Current | New | Component |
|---|---|---|
| `/` | `/` (unchanged) | `MixClubHome` (hallway) |
| `/how-it-works` | `/home` | `HowItWorks` (renamed to Home) |
| — | `/how-it-works` | `<Navigate to="/home" replace />` |

`src/config/routes.ts` — add `INTRO_HOME: '/home'`, keep `HOME: '/'`.

`src/routes/publicRoutes.tsx` — add `/home` route, add `/how-it-works` redirect.

`src/config/immersiveRoutes.ts` — no changes needed.

## Navigation Structure (logged-out)

```text
Platform            For Creatives     Studio              Community
├ Home (/home)      ├ For Artists     ├ Mixing Magic       ├ The Network
├ MixxCoinz         ├ For Engineers   ├ Mastering          ├ Mix Battles
├ Pricing           ├ For Producers   ├ AI Mastering       ├ Leaderboard
├ Showcase          └ For Fans        └ Distribution       └ Marketplace
└ About
```

Update in: `Navigation.tsx`, `HomeOverlayNav.tsx`, `PublicFooter.tsx`, `PublicPageLayout.tsx`.

## Internal Link Updates (~11 files)

All references to `/how-it-works` as a navigation target → `/home`:
- `SceneFlow.tsx`, `ClubScene.tsx`, `HomeHeroSection.tsx`, `EnhancedHero.tsx`, `AudioReactiveHero.tsx`, `Hero.tsx`, `InsiderDemo.tsx`, `InsiderDemoExperience.tsx`, `HomeOverlayNav.tsx`, `PublicPageLayout.tsx`, `PublicFooter.tsx`

## Total: ~15 files changed. No database changes.

