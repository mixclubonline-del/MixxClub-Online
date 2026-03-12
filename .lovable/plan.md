

## Elevate the `/go` Funnel — Show Mixxclub + Culture-Authentic Imagery

Two moves: (1) replace the weakest scene (ProofScene with its fake stats) with a **Product Showcase** that puts Mixxclub on screen and shows what separates it, and (2) generate hip-hop culture-authentic AI imagery for every scene background.

---

### 1. Replace ProofScene → "This Is Mixxclub" Scene

The current ProofScene has fake vanity stats (10,000+ projects, 500+ engineers, 98% satisfaction) and a made-up testimonial. It's the weakest link. Replace it with a scene that **shows the product**.

**New `ProofScene.tsx` — "This Is Mixxclub"**

- Mixxclub 3D logo at top (the `mixxclub-3d-logo.png` asset), animated entrance
- Headline: **"This is Mixxclub."**
- Feature showcase — 4 key differentiators as animated cards/pills with icons:
  - **AI Mastering** — "Velvet Curve masters your track in seconds, genre-aware"
  - **Engineer Matching** — "Connect with real engineers who get your sound"
  - **MixxCoinz Economy** — "Earn, spend, unlock — built for creators"
  - **Prime AI** — "Your personal A&R, mixing coach, and career guide"
- Each card fades in staggered (0.3s apart), with icon + short description
- Closing line: **"Everything independent artists need. Nothing they don't."**

Scene order stays the same — `proof` ID stays, just the component content changes. Arc becomes:

```text
1. Hook     → "87% never get mixed"
2. Answer   → "The system is broken"
3. Proof    → "This is Mixxclub" (PRODUCT SHOWCASE)
4. Culture  → "For Us. By Us."
5. TryIt    → "Hear the difference"
6. CTA      → Sign up
```

### 2. AI-Generated Hip-Hop Culture Scene Backgrounds

Create an edge function `generate-promo-imagery` that generates scene-specific backgrounds using Gemini image generation and saves them to `brand_assets` with the correct `asset_context` keys (`promo_hook`, `promo_answer`, `promo_proof`, `promo_culture`, `promo_tryit`, `promo_cta`).

Prompts will follow the culture doctrine: 50%+ African American, 25%+ Hispanic/Latino, streetwear, real studio/urban settings. Each scene gets a mood-matched prompt:

- **Hook**: Dark, moody — artist alone in bedroom studio, unreleased tracks on screen
- **Answer**: Broken system — artist frustrated at laptop, bills/rejection letters aesthetic
- **Proof (Product)**: Futuristic — glowing Mixxclub-style UI on screen, studio with tech
- **Culture**: Community — diverse group of creatives in studio, collaboration energy
- **TryIt**: Before/after — engineer at mixing console, waveforms on monitors
- **CTA**: Aspirational — artist on stage or in professional studio, success moment

Add an admin trigger button in the existing brand asset management flow, or a standalone admin action. The `usePromoAssets` hook already picks up `brand_assets` by context key — no frontend wiring needed for display.

### 3. Static Fallbacks

Use existing `src/assets/promo/` images as immediate fallbacks in `SceneBackground` so scenes aren't bare while AI images generate:
- Hook: `studio-console-hero.jpg`
- Answer: `mixing-console-close.jpg`
- Proof: `daw-interface-hero.jpg`
- Culture: `collaboration-hero.jpg`
- TryIt: `mastering-before-after.jpg`
- CTA: `journey-cta-join.jpg`

Update each scene component to import its fallback and pass it to `SceneBackground` when `asset.url` is null.

### Files

1. **`src/components/promo/scenes/ProofScene.tsx`** — Complete rewrite as "This Is Mixxclub" product showcase
2. **`src/components/promo/scenes/HookScene.tsx`** — Add static fallback image
3. **`src/components/promo/scenes/AnswerScene.tsx`** — Add static fallback image
4. **`src/components/promo/scenes/CultureScene.tsx`** — Add static fallback image
5. **`src/components/promo/scenes/TryItScene.tsx`** — Add static fallback image
6. **`src/components/promo/scenes/SignupScene.tsx`** — Add static fallback image
7. **`src/components/promo/scenes/SceneBackground.tsx`** — Accept `fallback` prop for static image when no dynamic asset
8. **`supabase/functions/generate-promo-imagery/index.ts`** — Edge function to generate all 6 scene backgrounds via Gemini and save to `brand_assets`

