

# Club Room Content Enhancement Plan

## Overview
Upgrade all 6 club rooms with real audio playback, embedded social proof, enhanced transitions, and interactive micro-interactions. This transforms the club tour from a static scroll experience into an immersive, interactive showcase.

## Architecture

The rooms are already well-structured with `ClubRoom` wrappers and glassmorphic styling (`mg-panel`, `mg-pill`). We'll enhance each room individually while maintaining the existing snap-scroll flow.

---

## Room-by-Room Changes

### 1. Listening Room — Before/After Audio Player
- Embed a compact before/after audio toggle directly into the track cards (reusing patterns from `BeforeAfterComparison.tsx`)
- Each track card gets a real waveform visualizer using the existing `AudioVisualizer` component
- Add a "switch" toggle that crossfades between raw and mastered versions
- Store demo audio URLs in `brand_assets` with context `club_listening_demo_*`
- Fallback to generated sine-wave visualization if no audio available

### 2. Vault Room — Milestone Unlock Animations
- Add confetti/particle burst when a milestone transitions from locked to unlocked (CSS keyframe, no library)
- Animate the progress bar with a glowing pulse when near completion (>80%)
- Add hover tooltips on each tier node showing unlock rewards
- Subtle parallax on the background image tied to scroll position

### 3. Green Room — Live Social Proof Carousel
- Embed a rotating testimonial strip from `SocialProofSection` data, restyled as glassmorphic quote cards
- Auto-rotating carousel (5s interval) with manual controls
- Show real avatar images where available with the existing `Avatar` component
- Add a floating "members joined today" live counter pill

### 4. Control Room — Interactive Step Reveals
- Convert the alternating steps to progressive reveals: each step "unlocks" as user scrolls into view
- Add hover-triggered stat counters that animate from 0 to final value (count-up)
- Video steps auto-play when in viewport, pause when out
- Add subtle parallax offset between image and text columns

### 5. VIP Booth — Plan Comparison Interactions
- Add monthly/yearly billing toggle with animated price transition
- Highlight feature differences on hover (dim non-included features on other plans)
- Add a subtle "sparkle" particle effect on the Most Popular card
- Gold ambient glow intensifies on hover for the VIP card

### 6. Stage Door — Urgency & Social Proof
- Add a live "X people signed up today" counter (from `funnel_events` table)
- Floating testimonial bubble that fades in/out showing recent quotes
- Pulsing CTA with dynamic copy based on milestone proximity
- Add keyboard shortcut hint ("Press Enter to join")

---

## Shared Enhancements

### Room Transitions
- Add parallax depth to `ClubAmbience` glow orbs based on scroll position
- Stagger child element reveals within each room using `whileInView` with increasing delays
- Add a subtle "room divider" visual between sections (gradient line or fog effect)

### ClubProgress Upgrade
- Fix mismatch: progress shows 5 dots but there are 6 rooms (add "Vault" dot)
- Add room name that appears next to the active dot
- Add a thin connecting line between dots showing scroll progress

### Interactivity Patterns
- Count-up animation hook for stats (reusable `useCountUp`)
- Intersection-based video autoplay/pause
- Hover-reveal stat overlays on all image cards

---

## New Files
- `src/hooks/useCountUp.ts` — Animated number counter hook
- `src/components/home/rooms/BeforeAfterMini.tsx` — Compact audio A/B toggle for Listening Room
- `src/components/home/rooms/TestimonialCarousel.tsx` — Glassmorphic testimonial rotator for Green Room
- `src/components/home/RoomDivider.tsx` — Visual separator between rooms

## Modified Files
- All 6 room components in `src/components/home/rooms/`
- `src/components/home/ClubProgress.tsx` — Add vault dot + progress line
- `src/components/home/ClubScene.tsx` — Update ROOM_IDS if needed
- `src/components/home/ClubRoom.tsx` — Optional parallax wrapper enhancement

## Database
- Query `brand_assets` for demo audio files (context: `club_listening_demo_before`, `club_listening_demo_after`)
- Query `funnel_events` for "signed up today" count on Stage Door
- No new tables needed

