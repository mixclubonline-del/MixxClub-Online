

## Evolve the Live Page — From Basic Grid to Immersive Live Scene

### What Exists Now
- **LivePage** (`/live`): Basic header + category tabs + grid of LiveCards + empty "Recent Streams" placeholder
- **LiveFeed**: Grid of stream cards with thumbnail, avatar, viewer count
- **LiveStreamView**: Watch page at `/watch/:streamId` with video, chat, gifts
- **WhosLiveWidget**: Compact sidebar widget for CRM panels
- **LiveActivityFeed** (home): Fake demo activity ticker (random generated, not real data)
- **useLiveStream hook**: Full DB integration — streams, chat, gifts, follows, coins
- **useLiveActivity hook**: Real activity feed from `activity_feed` table with fallback demos

### The Evolution Vision

Transform `/live` from a utilitarian stream directory into an immersive "Live Stage" scene — a living, breathing hub that feels like walking into the club.

### Plan

**1. Hero "Stage" Section**
- Featured/pinned stream as a large hero card with animated gradient border and live pulse
- Auto-selects the stream with highest viewer count
- Shows host avatar, title, viewer count, and a prominent "Watch Now" CTA
- If no one is live: atmospheric empty state with animated waveform visual and "The stage is quiet... be the first to go live"

**2. Real-Time Activity Sidebar**
- Replace the fake `LiveActivityFeed` pattern with the real `useLiveActivity` hook data
- Scrolling ticker of actual platform activity (uploads, signups, achievements)
- Realtime subscription for new events appearing with slide-in animations

**3. Stream Grid Upgrade**
- Two-column layout: main content (streams) + sidebar (activity + who's live)
- Stream cards get a subtle animated ring when live, category color coding
- "Starting Soon" section for scheduled streams (future-dated `started_at`)

**4. Recent Streams / Replays**
- Wire the "Recent Streams" placeholder to query `live_streams` where `is_live = false` and `recording_url IS NOT NULL`
- Card with replay badge, duration, and view count

**5. Live Stats Bar**
- Horizontal stats strip: total viewers across all streams, active streams count, gifts sent today
- Animated counters with realtime updates

**6. Category Chips Upgrade**
- Visual category pills with icons (headphones for mixing, waveform for mastering, mic for performance)
- Active count badge per category

### Files Changed
- `src/pages/LivePage.tsx` — full redesign with hero, stats bar, two-column layout
- `src/components/live/LiveHero.tsx` — new featured stream hero component
- `src/components/live/LiveStatsBar.tsx` — new real-time stats strip
- `src/components/live/RecentStreams.tsx` — new replays section
- `src/components/live/LiveFeed.tsx` — minor grid density tweaks

### Technical Details
- No DB changes needed — all data comes from existing `live_streams`, `activity_feed`, `stream_gifts` tables
- Uses existing `useLiveStreams`, `useLiveActivity` hooks
- Framer Motion for entrance animations and live pulse effects
- Responsive: single column on mobile, two-column on desktop

