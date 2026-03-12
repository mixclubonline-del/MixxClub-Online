

## Add Live Activity Ticker to Universal Media Player

### Current State
The player already has a basic "Now on Mixxclub" section (lines 299-318) that shows generic activity from `useLiveActivity`. It only appears when expanded, shows 3 items statically, and doesn't specifically surface **premieres** or **active sessions**.

### Changes

#### 1. Create `usePlayerTicker` hook
**File:** `src/hooks/usePlayerTicker.ts` — **Create**

A dedicated hook that fetches two specific data sources:
- **Live premieres** from `premieres` table where `status = 'live'` (title, artist, vote count)
- **Active sessions** from `collaboration_sessions` where `status = 'active'` (title, participant count)
- Merges both into a single ticker array with type labels ("Premiere" / "Live Session")
- Refetches every 30s, uses Supabase Realtime channel for instant updates on new premieres/sessions

#### 2. Add scrolling ticker to compact pill view
**File:** `src/components/player/UniversalMediaPlayer.tsx` — **Edit**

- Add a **horizontal scrolling marquee** below the compact controls that auto-scrolls through ticker items even when the player is collapsed
- Each ticker item shows: type badge (Premiere/Session) + title + time/votes
- Use CSS `@keyframes` marquee animation for smooth infinite scroll
- Keep the existing expanded "Now on Mixxclub" section but wire it to the new `usePlayerTicker` hook for richer data (premieres + sessions + general activity combined)

#### 3. Wire Supabase Realtime for instant updates
In `usePlayerTicker`, subscribe to `postgres_changes` on both `premieres` and `collaboration_sessions` tables so new premieres and sessions appear in the ticker within seconds, not on the next 30s poll.

### Result
The player pill always shows a scrolling ticker of live premieres and active sessions. Expanding reveals the full activity feed with more detail. Data comes from the database in real-time.

