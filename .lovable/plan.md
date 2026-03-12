

# Phase 10: End-to-End Testing & Bug Fixes

## Sprint 1: Critical Flow Fixes & Remaining Cleanup

### Findings from Audit

**Critical Bugs:**
1. **SessionDetail `isParticipant` hardcoded to `false`** -- Users who joined a session can never see participant-level UI. Must query `session_participants` table.
2. **DealPipeline `handleEdit` is a no-op** -- Clicking "Edit" on a deal does nothing. Needs toast or modal.
3. **HEAD request storms on every page load** -- `useOnlineUsers`, `useCollaborationStatus`, and platform stats hooks fire 10+ HEAD requests that get `ERR_ABORTED` on navigation. These are count-only queries that should be batched or debounced.
4. **~900 `console.log` statements remain** across 50 files -- Sprint 5 cleaned some but the majority remain (studio, audio mixer, collaboration, transport bridge, presence, waveform timeline, etc).

**UX Issues:**
5. **Analytics hook logs every page view to console** (`useAnalytics.tsx`) -- Noisy in production.
6. **`useEnergyAnalytics` logs transitions in DEV mode** -- Acceptable but clutters console.
7. **Cookie consent + tutorial popup + pathfinder beacon all competing** on first load -- three overlays fight for attention.

### Implementation Plan

**Task 1: Fix SessionDetail participant check**
Query `session_participants` for the current user's ID + session ID. Replace the hardcoded `false` with a real database lookup. This unlocks participant-level actions (chat, file sharing, collaboration tools).

**Task 2: Fix DealPipeline edit handler**
Add toast notification "Deal editing coming soon" or wire to an edit dialog if one exists nearby.

**Task 3: Batch/debounce platform stats queries**
The `useOnlineUsers` hook fires 3 separate HEAD requests (total users, engineers, artists) every 60 seconds. Consolidate into a single RPC call or at minimum ensure they don't fire on unmounted components. Same for `useCollaborationStatus` which fires 2 more.

**Task 4: Console.log cleanup (remaining 50 files)**
Remove or convert to `console.debug` across:
- `useAudioMixer.tsx` (7 logs)
- `useSimplifiedTransportBridge.ts` (5 logs)  
- `SessionPresence.tsx` (2 logs)
- `CollaborationWorkspace.tsx` (1 log)
- `WaveformTimeline.tsx` (3 logs)
- `VelvetCurveProcessor.ts` (1 log)
- `JourneyDashboard.tsx` (1 log)
- `TrackUploadManager.tsx` (1 log)
- `useVersionHistory.tsx` (1 log)
- `BeforeAfterPlayer.tsx` (1 log)
- `useSessionPermissions.tsx` (1 log)
- `useAnalytics.tsx` (suppress page_view logs in production)
- And ~38 more files

**Task 5: Overlay priority system**
Ensure cookie consent shows first, tutorial beacon waits until consent is dismissed, and pathfinder beacon only appears after onboarding is complete. Prevent three popups from stacking on first visit.

### File Impact
- **Edit**: `src/pages/SessionDetail.tsx` (participant check)
- **Edit**: `src/components/crm/clients/DealPipeline.tsx` (edit handler)
- **Edit**: `src/hooks/useOnlineUsers.tsx` (query consolidation)
- **Edit**: ~50 files (console.log cleanup)
- **Edit**: `src/App.tsx` or overlay components (popup priority)

### Estimated Scope
This sprint focuses on the highest-impact bugs first. Given the volume of console.log cleanup (~50 files), this will be split across two implementation passes: critical fixes first, then bulk cleanup.

