

# Mobile App Polish — PWA & Offline Hardening

## Current State Assessment

The mobile infrastructure is extensive: PWA manifest, Capacitor config, haptics, push notifications, offline indicator, background sync, CRM offline queue, bottom nav, splash screen, pull-to-refresh, and swipe navigation all exist. However several components are **built but not wired**:

1. **`SyncIndicator`** — fully built but never mounted in `App.tsx`
2. **No PWA Update Prompt** — `vite-plugin-pwa` is configured with `registerType: 'prompt'` but no UI handles the `onNeedRefresh` event, so users never see update notifications
3. **`PWAInstallPrompt`** dismissal is session-only (useState) — reappears on every visit
4. **No iOS install guidance** — iOS doesn't fire `beforeinstallprompt`, so iPhone users never see install instructions
5. **`useCRMOffline`** queue exists but is not connected to actual CRM mutation hooks

## Changes

### 1. Create `src/components/mobile/PWAUpdatePrompt.tsx` (~50 lines)
Uses `useRegisterSW` from `vite-plugin-pwa/react` to detect waiting service worker. Shows a toast-style banner: "A new version is available" with "Update Now" button that calls `updateServiceWorker(true)`. Positioned above bottom nav with proper z-index.

### 2. Update `src/components/mobile/PWAInstallPrompt.tsx` (~15 lines changed)
- Persist dismissal in `localStorage` with 7-day expiry (don't nag daily)
- Add iOS-specific guidance: detect iOS + non-standalone → show "Tap Share → Add to Home Screen" instruction instead of the install button

### 3. Mount `SyncIndicator` and `PWAUpdatePrompt` in `App.tsx` (~5 lines)
- Import and render `SyncIndicator` and `PWAUpdatePrompt` inside `AppContent`, alongside existing `OfflineIndicator`
- Only render on mobile via `useMobileDetect`

### 4. Enhance `OfflineIndicator.tsx` (~20 lines changed)
- Add pending sync count from `useBackgroundSync` — show "3 changes pending" alongside the offline message
- Position-aware: shift up when mobile bottom nav is visible (bottom-20 instead of top-16) to avoid overlap
- Add manual "Sync Now" button when back online with pending items

### 5. Wire `useCRMOffline` into CRM data hooks (~30 lines across 2 files)
In `src/hooks/useCRMClients.ts` and `src/hooks/useCRMDeals.ts`:
- Wrap mutation calls: if offline, queue via `useCRMOffline.queueAction` instead of direct Supabase write
- On query, fall back to `getCachedData` when offline
- Cache successful query results via `cacheData`

## Files Summary

| File | Action |
|------|--------|
| `src/components/mobile/PWAUpdatePrompt.tsx` | Create — SW update notification UI |
| `src/components/mobile/PWAInstallPrompt.tsx` | Edit — localStorage dismissal + iOS guidance |
| `src/App.tsx` | Edit — mount SyncIndicator + PWAUpdatePrompt |
| `src/components/mobile/OfflineIndicator.tsx` | Edit — pending count + position fix + sync button |
| `src/hooks/useCRMClients.ts` | Edit — wire offline queue + cache |
| `src/hooks/useCRMDeals.ts` | Edit — wire offline queue + cache |

No database changes needed.

