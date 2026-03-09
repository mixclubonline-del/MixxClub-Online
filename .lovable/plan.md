

# Public Economy Landing Page

## Problem
The `/economy` route is currently protected (inside `appRoutes.tsx`), so unauthenticated visitors hitting links from the Footer, Pricing page, or role pages get redirected to login. We need a public-facing explainer page that markets the MixxCoinz ownership model to visitors, with a CTA to sign up.

## Approach

### 1. Create `src/pages/EconomyPublic.tsx`
A cinematic marketing page (matching the Showcase-First visual standard) with these sections:

- **Hero** — MixxCoin3D component with cosmic gradient background, headline "Own Your Value", subtitle about the ownership economy
- **Dual Coin Explainer** — Earned (Soundwave) vs Premium (Crown) coin cards, reusing the visual pattern from MixxEconomy but static/public
- **How It Works** — 4-step journey: Earn → Spend → Unlock → Own (using ShowcaseJourney pattern)
- **Tier System** — Visual grid of fan tiers (Newcomer → Legend) with benefits at each level
- **Role Benefits** — Cards showing what each role earns: Artists (mix revenue), Engineers (service tips), Producers (beat sales), Fans (engagement missions)
- **CTA Section** — "Start Earning" button → `/auth?signup=true`
- **PublicFooter** at bottom

### 2. Update `src/routes/publicRoutes.tsx`
Add `/economy` route pointing to `EconomyPublic` (lazy-loaded).

### 3. Update `src/routes/appRoutes.tsx`
Keep the authenticated `/economy` route as-is — it renders the full dashboard with wallet, missions, vault, ledger. The public route will be matched first for unauthenticated users; authenticated users accessing `/economy` within the protected layout get the full dashboard.

### 4. Route Conflict Resolution
Since `publicRoutes` renders before `appRoutes` in the router, add logic so the public economy page checks auth state: if logged in, redirect to the app version. Or simply let both coexist — public route outside `ProtectedRoute` wrapper, app route inside it. The router naturally resolves this since `appRoutes` is wrapped in `ProtectedRoute`.

## Files Changed
1. **New:** `src/pages/EconomyPublic.tsx` — public marketing page
2. **Edit:** `src/routes/publicRoutes.tsx` — add `/economy` route

