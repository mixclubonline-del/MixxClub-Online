

# The Ecosystem Story — A Cinematic Scene Experience

## Vision

This isn't a features page with nodes and grids. This is a **cinematic story told in scenes** — the same architecture as the `/go` promo funnel. Full-bleed visuals, minimal text, swipe/scroll-driven, Dream Engine imagery powering every frame.

Four emotional chapters. Four characters. One ecosystem.

## The Scenes

### Scene 1 — "The Hard Drive" (Artist Pain)
Full-screen image/video: A young artist alone in a dimly lit bedroom, laptop open, headphones on, staring at a folder of unreleased tracks. Maybe 47 songs. None released. The mix isn't right. They know it. They can feel it.
- **One line of text**: *"47 songs. Zero releases. The mix isn't right and you know it."*
- Character: Jax's world. Purple/violet tones.

### Scene 2 — "The Empty Chair" (Engineer Pain)  
Full-screen: An engineer in a home studio — monitors glowing, plugins loaded, acoustic panels on the walls. Professional setup. No clients. Scrolling Instagram. Thinking about selling the gear.
- **One line**: *"$12,000 in gear. $200/month in plugins. Zero clients this week."*
- Character: Prime's world. Cyan/teal tones.

### Scene 3 — "Type Beat #347" (Producer Pain)
Full-screen: A producer at their workstation, YouTube Studio analytics showing single-digit views on "Travis Scott Type Beat." Beat after beat uploaded into the void. No artist ever reaches out.
- **One line**: *"347 type beats. 12 subscribers. No one's calling."*
- Character: Rell's world. Amber/gold tones.

### Scene 4 — "The Scroll" (Fan Disconnect)
Full-screen: A fan on their phone, endlessly scrolling, double-tapping, but never actually connecting. They love the music but they're just a number. A stream count.
- **One line**: *"You stream 4 hours a day. They don't even know your name."*
- Character: Nova's world. Rose/pink tones.

### Scene 5 — "The Connection" (The Turn)
This is where it flips. Split-screen or rapid montage showing all four connecting through MixxClub. The artist finds an engineer. The producer's beat gets placed. The fan funds a session and gets credited.
- **One line**: *"What if everyone ate?"*
- Transition to full ecosystem color palette — all four accent colors merging.

### Scene 6 — "The Ecosystem" (The Model)
Now — and only now — do we show the cycle. But not as a diagram. As a **living, breathing visual**: money flowing, music moving, people connecting. Animated, cinematic, using the character avatars in motion.
- Brief stats overlay: "70/30 split. You keep 70%. Period."
- The four revenue streams, shown as visual flows not text grids.

### Scene 7 — "Pick Your Path" (CTA)
Four doors/portals, one for each role, each glowing with their accent color. Tap to enter your world.
- Links to `/for-artists`, `/for-engineers`, `/for-producers`, `/for-fans`
- Secondary: "Create Account"

## Technical Architecture

### Dream First — Generate Assets Before Code

**Step 1**: Use the Dream Engine to generate 6-7 cinematic images for the scene backgrounds:
- `ecosystem_artist_pain` — bedroom studio, unreleased tracks
- `ecosystem_engineer_pain` — empty professional studio
- `ecosystem_producer_pain` — type beat grind
- `ecosystem_fan_disconnect` — scrolling on phone
- `ecosystem_connection` — the turn, people connecting
- `ecosystem_cycle` — the living ecosystem
- `ecosystem_cta` — four glowing portals

**Step 2**: Build the page using the same scene controller pattern as `/go` (PromoFunnelController):
- Full-screen scenes with swipe/scroll navigation
- Dream Engine assets loaded via `useDynamicAssets` with `ecosystem_` context prefix
- Auto-advance with pause capability
- Mobile-first vertical swipe

### New Files
- `src/pages/ForCreatives.tsx` — Page wrapper with SEO
- `src/components/creatives/EcosystemStoryController.tsx` — Scene controller (mirrors PromoFunnelController pattern)
- `src/components/creatives/scenes/` — Individual scene components (ArtistPainScene, EngineerPainScene, ProducerPainScene, FanDisconnectScene, ConnectionScene, EcosystemScene, PickPathScene)
- `src/hooks/useEcosystemAssets.ts` — Asset loader for `ecosystem_` context images

### Modified Files
- `src/config/routes.ts` — Add `FOR_CREATIVES: '/for-creatives'`
- `src/routes/publicRoutes.tsx` — Add route
- `src/components/Navigation.tsx` — Add "The Ecosystem" to For Creatives dropdown
- `src/hooks/useDynamicAssets.ts` — Add `ecosystem_*` section keys
- `src/pages/Sitemap.tsx` — Add entry

### Execution Order
1. **Dream first** — Generate all 7 ecosystem images via Dream Engine, save to `brand_assets` with `ecosystem_` contexts
2. **Build the controller** — Scene-based page with asset loading
3. **Wire routes and nav** — Connect everything

No database schema changes. Uses existing `brand_assets` table and Dream Engine infrastructure.

