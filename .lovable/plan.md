

# Sprint 3 Plan: Beat Marketplace, Sample Packs, Live Streams, Battle Seasons

Sprint 3 covers **8C.3**, **8C.4**, **8D.1**, and **8D.2**.

---

## Task 1: Beat Marketplace Enhancements (8C.3)

**Goal**: Upgrade BeatCard with waveform previews, instant purchase flow, and license comparison modal.

**Changes**:
- **Edit `src/components/producer/BeatCard.tsx`**: Replace the static cover placeholder with an inline WaveSurfer mini-waveform that plays on hover/click. Add instant "Buy" button with price badge and license type indicator.
- **New `src/components/producer/LicenseComparisonModal.tsx`**: Side-by-side comparison of license tiers (Basic/Premium/Exclusive) with rights, deliverables, and pricing. Triggered from BeatCard.
- **New `src/components/producer/BeatAnalytics.tsx`**: Per-beat stats panel (plays, purchases, revenue, conversion rate) using existing `beat_plays`/`beat_purchases` data. Accessible from ProducerCatalogHub.
- **Edit `src/components/crm/producer/ProducerCatalogHub.tsx`**: Add "Analytics" as a 5th catalog mode tab.

---

## Task 2: Sample Pack Builder (8C.4)

**Goal**: Let producers bundle beats + stems + loops into downloadable packs with pricing.

**Changes**:
- **DB Migration**: New `sample_packs` table (id, producer_id, title, description, cover_url, price_cents, status, items JSONB, download_count, created_at) with RLS for owner CRUD and public read.
- **New `src/components/producer/SamplePackBuilder.tsx`**: Multi-step wizard using GlassPanel tokens — select items from catalog, set pack title/description/cover/price, preview, publish. Uses react-dropzone for cover upload.
- **New `src/hooks/useSamplePacks.ts`**: CRUD hook for sample_packs table + JSZip download generation.
- **Edit `src/components/crm/producer/ProducerCatalogHub.tsx`**: Add "Packs" as a 6th catalog mode tab mounting the builder.

---

## Task 3: Live Stream View (8D.1)

**Goal**: Full-featured stream viewer with real-time chat, gift animations, and viewer count.

**Changes**:
- **New `src/components/live/LiveStreamView.tsx`**: Main viewer layout — video/placeholder area, real-time chat sidebar (using existing `stream_chat_messages` table + Supabase Realtime), gift picker (existing `GiftPicker.tsx`), gift animations (existing `GiftAnimation.tsx`), viewer count badge. Uses GlassPanel tokens.
- **New `src/components/live/StreamChat.tsx`**: Real-time chat component subscribing to `stream_chat_messages` via `postgres_changes`. Supports send, system messages, pinned messages.
- **Edit `src/pages/LivePage.tsx`**: Add route param support so clicking a stream card navigates to the stream view.
- **Edit `src/hooks/useLiveStream.ts`**: Add `useStreamChat` hook for real-time message subscription + send mutation.
- **DB Migration**: Enable realtime on `stream_chat_messages` table (`ALTER PUBLICATION supabase_realtime ADD TABLE stream_chat_messages`).

---

## Task 4: Battle League Seasons (8D.2)

**Goal**: Seasonal brackets with leaderboard resets, trophy case, and season progression.

**Changes**:
- **DB Migration**: New `battle_seasons` table (id, name, description, season_number, start_date, end_date, status, prize_pool_cents, rules JSONB, created_at) with public read RLS. New `battle_season_entries` table (id, season_id, user_id, wins, losses, draws, points, rank, trophies JSONB) with user-read RLS.
- **New `src/components/arena-hub/SeasonBracket.tsx`**: Visual bracket/standings for the current season — leaderboard table, points progression, next match countdown. GlassPanel tokens.
- **New `src/components/arena-hub/TrophyCase.tsx`**: Profile-embeddable trophy display showing past season placements and badges. Pulls from `battle_season_entries`.
- **Edit `src/components/arena-hub/TournamentBracket.tsx`**: Add season context — show which season the tournament belongs to, season standings link.
- **New `src/hooks/useBattleSeasons.ts`**: Query hooks for seasons, entries, and user standings.

---

## Technical Notes

- All new components use `GlassPanel`/`HubHeader` design tokens, mobile-first at 375px
- WaveSurfer mini-player in BeatCard uses existing `wavesurfer.js` dependency
- Live chat uses Supabase Realtime `postgres_changes` — no new edge functions needed
- Sample pack downloads use existing `jszip` dependency for client-side ZIP generation
- New tables get RLS: sample_packs (owner write, public read), battle_seasons (public read), battle_season_entries (owner read, admin write)

