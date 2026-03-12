

## Fix Remaining Overlap Issues on Mobile

### What I Found

Testing on both desktop (1280x720) and mobile (375x812) revealed:

**Desktop** — Clean. No overlapping elements in corners. PrimeConsole and PrimeStatusBar successfully removed.

**Mobile** — The `ProactivePrimeBot` component (rendered inside CRM pages) takes up ~40% of the screen as a fixed overlay at `bottom-24 right-6 z-50`, overlapping both page content and the CookieConsent banner. This is the "Prime / Lead Engineer / The OG" card visible in the screenshot.

**UniversalMediaPlayer** — Only renders when a track is playing (`currentTrack` exists), so it wasn't visible during testing. Its positioning looks correct: centered horizontally, `bottom-24` on phone, `bottom-6` on desktop.

### Changes

#### 1. Fix ProactivePrimeBot mobile positioning
**File:** `src/components/crm/ai/ProactivePrimeBot.tsx` (line 404)

- Change from `fixed bottom-24 right-6` to a mobile-responsive position
- On phone: render as a **top banner** or **inline card** instead of a fixed overlay to avoid covering content
- On desktop/tablet: keep as a fixed card but position it to not collide with the universal player

#### 2. Ensure CookieConsent doesn't overlap with player
**File:** `src/components/legal/CookieConsent.tsx`

- Verify its z-index and positioning don't conflict with the media player on mobile
- If needed, increase bottom offset when media player is active

#### 3. Verify no remaining collisions
- PathfinderBeacon (bottom-left) should be clear now that PrimeConsole is removed
- GlobalPrimeChat only shows for unauthenticated users, no conflict with CRM bot

### Files to edit
| File | Change |
|---|---|
| `src/components/crm/ai/ProactivePrimeBot.tsx` | Make mobile-responsive: inline/top-toast on phone instead of fixed overlay |
| `src/components/legal/CookieConsent.tsx` | Verify/adjust z-index to clear the media player |

