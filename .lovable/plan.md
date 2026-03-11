

# Cinematic Profile & CRM Parity — All Roles

## Current State

The engineer got a cinematic public profile at `/engineer/:userId` with immersive hero, glassmorphic stats, DAW/equipment parsing, audio player, and inline booking. The other roles have:

- **Artist**: No dedicated `/artist/:userId` page. Public profile is the generic `/u/:username` (flat Tabs UI, no glassmorphism, no role-specific sections).
- **Producer**: No dedicated `/producer/:userId` page. Same generic `/u/:username`.
- **Fan**: No public profile page beyond `/u/:username`.
- **CRM dashboards**: All 4 roles use `CRMPortal` which already has cinematic backgrounds, glassmorphic shells, and role-specific glow palettes. The internal hubs already use design tokens. The main gaps are inconsistent loading screens and missing onboarding flows for Producer and Fan.

## What This Plan Covers

Given the scope, this is split into two focused deliverables. Due to message size limits, **this plan covers Part 1** (the two highest-impact public profile pages). Part 2 (CRM dashboard polish) can follow.

---

### Part 1A: Artist Profile Page (`/artist/:userId`)

Create `src/pages/ArtistProfile.tsx` — cinematic showcase mirroring the Engineer Profile pattern but tailored for artists:

**Sections:**
1. **Cinematic Hero** — Purple accent glow, avatar with glassmorphic ring, name/username/location/verification badge, genre tags
2. **Glassmorphic Stats Bar** — Followers, Released tracks, Projects completed, Community level
3. **Discography / Music Player** — Query `audio_files` for the artist's tracks, mini playlist with playback (same pattern as engineer samples)
4. **Collaboration History** — Query `projects` where `client_id = userId`, show completed projects with engineer credits
5. **Reviews & Testimonials** — Query `reviews` where `reviewed_id = userId`, glass cards with staggered animation
6. **Inline Collaboration Request** — Instead of booking a "session," artists get a "Propose Collaboration" form: project type selector (Single / EP / Album / Feature), message textarea, insert into `collaboration_sessions` with `status: 'pending'`

**Data sources:** `profiles`, `audio_files`, `projects`, `reviews`, `achievements` — all existing tables.

**Route:** Add `/artist/:userId` to `appRoutes.tsx`.

---

### Part 1B: Producer Profile Page (`/producer/:userId`)

Create `src/pages/ProducerProfile.tsx` — gold/amber accent, tailored for beat makers:

**Sections:**
1. **Cinematic Hero** — Amber accent glow, avatar, genres, "X beats available" tagline
2. **Glassmorphic Stats Bar** — Beats uploaded, Total sales, Average rating, Years active
3. **Beat Catalog Preview** — Query `producer_beats` where `user_id = userId`, show top 6 beats with BPM, key, genre tags, and play button (using `preview_url` or `audio_url`)
4. **License Tiers Display** — Show available license types and pricing from `producer_beats` metadata (read-only showcase of what the producer offers)
5. **Collaboration Credits** — Query `partnerships` and `projects` to show artist collaborations
6. **Inline Beat Inquiry** — "Request Custom Beat" form: genre selector, reference track URL input, budget range, message — inserts into `collaboration_sessions`

**Data sources:** `profiles`, `producer_beats`, `producer_stats`, `partnerships`, `beat_purchases` — all existing.

**Route:** Add `/producer/:userId` to `appRoutes.tsx`.

---

### Part 1C: Upgrade PublicProfile Role Awareness

Update `src/pages/PublicProfile.tsx` to detect the viewed user's role and show a banner linking to their dedicated profile:
- If role is `engineer` → "View full studio profile" link to `/engineer/:id`
- If role is `artist` → "View artist showcase" link to `/artist/:id`
- If role is `producer` → "View beat catalog" link to `/producer/:id`

This keeps `/u/:username` as a lightweight social profile while promoting the role-specific cinematic pages.

---

### Part 2 (follow-up): CRM Dashboard Polish

The CRM dashboards already share the `CRMPortal` shell with role-specific backgrounds. The remaining gaps for a follow-up pass:
- Producer CRM: Add slideshow + assistant intro (Artist and Engineer already have these)
- Fan Hub: Add lazy loading for hub components (currently eagerly imported)
- All CRMs: Standardize the loading spinner to use `HubSkeleton` instead of the raw CSS spinner
- Fan Hub profile object: Fetch from DB instead of constructing from `user_metadata`

---

## Technical Details

**New files:**
- `src/pages/ArtistProfile.tsx` (~600 lines, mirrors EngineerProfile structure)
- `src/pages/ProducerProfile.tsx` (~600 lines, mirrors EngineerProfile structure)

**Modified files:**
- `src/routes/appRoutes.tsx` — add 2 new routes
- `src/pages/PublicProfile.tsx` — add role-aware redirect banners

**No database migrations needed.** All data sources exist.

**Shared patterns from EngineerProfile:**
- `stagger` / `fadeUp` motion variants
- `audioRef` + `playingTrackId` for audio playback
- Glassmorphic stat cards with `bg-white/[0.03] backdrop-blur-xl border-white/8`
- Inline booking via `collaboration_sessions` insert
- Auth gate for booking actions

