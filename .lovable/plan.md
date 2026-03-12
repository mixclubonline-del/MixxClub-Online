

# Phase 9 Sprint 5: Final Polish & Launch Prep

## Audit Findings

### Critical Issues
1. **Duplicate Supabase client** — `src/services/supabaseClient.ts` creates a second client using `VITE_SUPABASE_ANON_KEY` (which doesn't exist in `.env`). It's imported by zero files. Must be deleted to prevent confusion.

2. **Stale console.log statements** — 306 matches across 23 frontend files. Per the 120% standard, production code must not have debug logs. Clean up all non-error console output from components, hooks, and services.

3. **Dangling TODOs** — 125 matches across 19 files. Stub handlers (`console.log('TODO: ...')`) violate the "no placeholders" rule. Each must be either implemented or replaced with a proper no-op / toast notification.

### Polish Items
4. **PaymentCanceled page** is functional but bare — no confetti inverse, no branded styling, no contextual return links (e.g., return to the specific checkout type that was abandoned).

5. **Invoice download outputs raw JSON** — `PaymentSuccess.tsx` line 99 creates a `.json` blob. Should generate a proper PDF invoice using the already-installed `jspdf` + `jspdf-autotable` packages.

## Implementation Plan

### Task 1: Delete duplicate Supabase client
Remove `src/services/supabaseClient.ts` entirely. Zero imports reference it.

### Task 2: Scrub console.log from frontend
Remove or convert to `console.debug` (stripped in prod builds) across the 23 files with matches. Keep `console.error` and `console.warn` for genuine error paths. Key files:
- `AudioFileImporter.tsx`, `TrackScheduler.ts`, `StudioTransport.tsx` (DAW debug logs)
- `DirectMessaging.tsx`, `useConnectionRecovery.tsx` (realtime logs)
- `SunoTest.tsx`, `DistributionHub.tsx`, `SplashScreen.tsx`
- `useKeyboardShortcuts.ts` (12 stub actions)

### Task 3: Resolve critical TODOs
Replace stub `console.log('TODO:...')` handlers with proper implementations or user-facing toasts:
- `SessionManager.tsx` — show "Session restore coming soon" toast
- `TrackStrip.tsx` — open plugin editor or show "Plugin editor coming soon"
- `DAWCollaboration.tsx` — already copies invite link, just remove TODO comment
- `DealPipeline.tsx` / `ProducerCollabsHub.tsx` — wire to existing detail modals or show toast
- `useKeyboardShortcuts.ts` — connect zoom/blade/group actions to store or show toast
- `MeteringPanel.tsx` — remove TODO comments (simulation is acceptable for v1)

### Task 4: Upgrade PaymentCanceled page
- Match the branded gradient styling of PaymentSuccess
- Add contextual messaging based on `?type=` search param (subscription, mixing, mastering, beat)
- Add "Try again" button that returns to the correct checkout URL
- Add FAQ link for payment issues

### Task 5: Fix invoice download to PDF
Replace JSON blob download in `PaymentSuccess.tsx` with proper PDF generation using `jspdf` + `jspdf-autotable`:
- Company header with MixxClub branding
- Payment details table (amount, date, package, transaction ID)
- Download as `MixxClub-Invoice-{id}.pdf`

## File Impact Summary
- **Delete**: `src/services/supabaseClient.ts`
- **Edit (~23 files)**: Console.log cleanup across components/hooks/services
- **Edit (~8 files)**: TODO resolution
- **Edit**: `src/pages/PaymentCanceled.tsx` (branded upgrade)
- **Edit**: `src/pages/PaymentSuccess.tsx` (PDF invoice)

