

# Admin Tooling & Moderation — Audit Plan

## Current State

The admin panel already has:
- **Users hub**: Search, paginate, view detail slide-over, assign/remove roles
- **Content hub**: Flag/hide/delete audio files and beats (but uses `waveform_data` as a hack for flagging audio)
- **System hub**: Launch mode toggle, waitlist management, invite codes, seeding panel, payout processing, security events
- **Other tabs**: Revenue, sessions, analytics, audit logs, partnerships, branding, Prime Brain, screenshots

## Gaps Found

| # | Issue | Impact |
|---|-------|--------|
| 1 | No user suspension/ban capability — admin can manage roles but cannot disable a user account | Abusive users cannot be stopped without manual DB intervention |
| 2 | No content reporting system — users cannot report inappropriate content; no moderation queue | Platform has no community-driven content safety |
| 3 | Feature flags are hardcoded in `featureFlags.ts` — no admin UI to toggle them at runtime | Deploying a code change to flip a flag; no hot-toggling |
| 4 | No system health dashboard — no DB size, edge function error rates, or uptime indicators | Admin flies blind on infrastructure health |
| 5 | Content moderation uses `waveform_data` column as a hack for audio flagging | Fragile, semantically wrong, will break if waveform data is actually used |

## Plan

### 1. User suspension system
- **Migration**: Add `is_suspended BOOLEAN DEFAULT false` and `suspended_at TIMESTAMPTZ` and `suspension_reason TEXT` columns to `profiles` table
- **AdminUsersHub**: Add "Suspend User" / "Unsuspend User" action button per user row with confirmation dialog and reason input
- **Auth guard**: In `ProtectedRoute`, after auth resolves, check `profiles.is_suspended` — if true, show a "Your account has been suspended" screen and call `signOut()`
- **AdminUserDetail**: Show suspension status and reason in the detail panel

### 2. Content reporting & moderation queue
- **Migration**: Create `content_reports` table (id, reporter_id, content_type, content_id, reason, details, status, resolved_by, resolved_at, created_at) with RLS
- **User-facing**: Add a "Report" option in beat/audio action menus (small flag icon) that opens a reason picker modal
- **Admin**: Create `AdminModerationQueue.tsx` — shows pending reports with content preview, reporter info, and resolve/dismiss actions. Wire into AdminCRM as a new "Moderation" tab
- Links to existing flag/hide/delete actions in AdminContentHub

### 3. Runtime feature flags admin UI
- **Migration**: Create `feature_flags` table (key TEXT PRIMARY KEY, enabled BOOLEAN, updated_at, updated_by) — seed with current hardcoded values
- **Create `AdminFeatureFlagsHub.tsx`**: Grid of toggle switches, one per flag, with labels and descriptions. Updates the DB row on toggle.
- **Update `featureFlags.ts`**: Add a `useFeatureFlags()` hook that reads from the DB table (with fallback to hardcoded defaults), replacing the static `FEATURE_FLAGS` object for runtime checks
- Wire into AdminCRM as a new "Features" tab

### 4. System health dashboard
- **Create `AdminHealthDashboard.tsx`**: Card grid showing:
  - Total DB rows across key tables (profiles, projects, payments, audio_files, producer_beats)
  - Edge function invocation stats (from `system_metrics` table, already collected by `collect-system-metrics`)
  - Recent error count from `admin_security_events`
  - Storage usage estimate (count files in `audio_files`)
  - Auto-refresh every 60s
- Wire into AdminSystemHub as a section at the top

### 5. Fix audio flagging to use proper column
- **Migration**: Add `moderation_status TEXT DEFAULT 'active'` to `audio_files` (values: active, flagged, hidden, removed)
- **Update AdminContentHub**: Replace `waveform_data` hack with `moderation_status` column for flag/hide checks
- Backward-compatible — existing flagged items migrate via a one-time UPDATE in the migration

## Execution Order

```text
1. User suspension (profiles migration + auth guard + admin UI)
2. Content reporting table + user report modal + moderation queue
3. Feature flags DB table + admin UI + runtime hook
4. System health dashboard
5. Audio moderation_status column fix
```

## Files Created
- `src/components/admin/AdminModerationQueue.tsx`
- `src/components/admin/AdminFeatureFlagsHub.tsx`
- `src/components/admin/AdminHealthDashboard.tsx`
- `src/components/shared/ReportContentModal.tsx`
- `src/hooks/useFeatureFlags.ts`

## Files Modified
- `src/pages/AdminCRM.tsx` — add Moderation, Features tabs
- `src/components/admin/AdminUsersHub.tsx` — suspend/unsuspend actions
- `src/components/admin/AdminUserDetail.tsx` — show suspension info
- `src/components/admin/AdminContentHub.tsx` — use `moderation_status`, link to reports
- `src/components/admin/AdminSystemHub.tsx` — embed health dashboard
- `src/components/auth/ProtectedRoute.tsx` — suspension check
- `src/config/featureFlags.ts` — export runtime hook alongside static fallback
- Beat/audio detail components — add Report button

