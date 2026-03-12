

## Declutter Corners and Build a Universal Media Player

### Problem
Multiple floating elements compete for screen real estate:
- **Bottom-left**: PrimeConsole ticker + PrimeStatusBar both fixed, overlapping dashboard content
- **Bottom-right**: GlobalAudioPlayer + GlobalPrimeChat stacking on each other
- **Bottom bar**: GlobalMusicPlayer spans full width but collides with mobile nav and other floaters
- Two separate audio players (GlobalAudioPlayer and GlobalMusicPlayer) exist simultaneously

### Changes

#### 1. Remove PrimeConsole and PrimeStatusBar from corners
- **Hide both** from App.tsx (`DesktopOnlyComponents` renders them). They add visual noise with mock data.
- Optionally embed a compact Prime status indicator into the desktop sidebar/header later.

#### 2. Remove the old GlobalAudioPlayer
- It duplicates GlobalMusicPlayer's functionality (both use play/pause/volume for audio).
- Remove it from `AuthGatedOverlays` in App.tsx.

#### 3. Replace GlobalMusicPlayer with a centered Universal Media Player
Build a new `UniversalMediaPlayer` component that:
- **Renders as a centered floating panel** (horizontally centered, vertically near bottom but above nav) instead of a full-width bottom bar.
- **Supports multiple media types**: audio tracks, video content, and live streams via a `mediaType` field on tracks (`'audio' | 'video' | 'live'`).
- **Shows contextual content**: album art for audio, embedded video for video, live badge + viewer count for streams.
- **Includes a "Now on Mixxclub" ticker** showing live activity (premieres, active sessions, new releases) — absorbing the purpose PrimeConsole served.
- **Expandable**: compact pill view (artwork + play/pause + title) that expands into a larger card with full controls, queue, and waveform/video area.
- **Proper z-indexing** using `Z_INDEX.musicPlayer` (45), below dialogs and chat.

#### 4. Update GlobalPlayerContext
- Extend the `Track` type to include `mediaType: 'audio' | 'video' | 'live'` and optional `videoUrl` / `streamUrl`.
- Add a `liveActivity` state array for the "Now on Mixxclub" ticker section.

#### 5. Reposition GlobalPrimeChat
- Keep it bottom-right but update `usePrimePosition` to no longer account for the old bottom-bar player offset, since the new player is centered and won't overlap the chat bubble.

### Files to create/edit
| File | Action |
|---|---|
| `src/components/player/UniversalMediaPlayer.tsx` | **Create** — new centered, expandable media player |
| `src/contexts/GlobalPlayerContext.tsx` | **Edit** — extend Track type with mediaType, videoUrl, streamUrl |
| `src/App.tsx` | **Edit** — remove PrimeConsole, PrimeStatusBar, GlobalAudioPlayer; swap GlobalMusicPlayer for UniversalMediaPlayer |
| `src/hooks/usePrimePosition.ts` | **Edit** — simplify offset calculation |
| `src/components/player/GlobalMusicPlayer.tsx` | Keep file but no longer imported in App |

### Onboarding Wizard
The onboarding wizard (`OnboardingPortal`) already renders `fixed inset-0` (full-screen centered). No changes needed there.

