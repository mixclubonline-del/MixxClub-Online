

# Sprint 4 Plan: Fan Hub, Enhanced Chat, Challenges, Admin Analytics, White-Label, Bulk Ops

Sprint 4 covers **8D.3** (Fan Engagement Hub), **8D.4** (Enhanced Chat), **8D.5** (Community Challenges), **8A.5** (Admin Analytics Dashboard), **8B.3** (White-Label Config), **8B.4** (Bulk Operations).

---

## Task 1: Fan Engagement Hub (8D.3)

Existing components: `FanTrophiesHub`, `MyDay1Artists`, `Day1Badge`, `Day1Opportunity`, `useFanStats`, `useDay1Status`. This task unifies them into a single `FanEngagementHub.tsx`.

- **New `src/components/community/FanEngagementHub.tsx`**: GlassPanel-based hub with tabs: Day 1 Showcase (artist cards with tier badges), Milestones Timeline (artist growth events from `artist_day1s`), Fan Leaderboard (top supporters ranked by discovery score), Streak Rewards (engagement streak visualization from `useFanStats`).
- Composes existing `MyDay1Artists`, `Day1Badge`, `FanTrophiesHub` components rather than rebuilding.
- Mount in CommunityHub as a new tab.

## Task 2: Enhanced Chat (8D.4)

Messages table already has `thread_id`. Build threaded replies + reactions.

- **DB Migration**: New `message_reactions` table (id, message_id FK, user_id, emoji, created_at) with RLS. Add `reply_count` column to `messages`.
- **New `src/components/messaging/ThreadedChat.tsx`**: Thread view showing parent message + replies. Reply button opens inline composer. Uses `thread_id` for grouping.
- **New `src/components/messaging/MessageReactions.tsx`**: Emoji picker (6 preset emojis), click to toggle reaction, shows reaction counts with avatars.
- Edit existing messaging components to integrate thread expansion and reaction bar.

## Task 3: Community Challenges v2 (8D.5)

Existing `CommunityChallenges.tsx` computes progress from projects/achievements. Upgrade to support admin-created challenges with voting.

- **DB Migration**: New `community_challenges` table (id, title, description, challenge_type, start_date, end_date, status, rules JSONB, prizes JSONB, submission_count, created_by). New `challenge_submissions` table (id, challenge_id, user_id, title, media_url, description, vote_count, created_at). RLS: public read, authenticated submit, admin create.
- **New `src/components/community/ChallengesHub.tsx`**: Browse active/upcoming/past challenges, submit entries, vote on submissions, leaderboard per challenge. GlassPanel tokens.
- **New `src/hooks/useChallenges.ts`**: CRUD hooks for challenges and submissions.
- Wire into CommunityHub replacing or alongside existing CommunityChallenges tab.

## Task 4: Admin Analytics Dashboard (8A.5)

Existing `AdminDashboardHub` has basic stats. Build a dedicated analytics view.

- **New `src/components/admin/AdminAnalyticsDashboard.tsx`**: GlassPanel-based dashboard with: Funnel visualization (from `funnel_events` — signup → onboarding → first project → paid), Cohort retention chart (Recharts heatmap by signup week), Revenue per channel breakdown, A/B test results viewer (from `ab_tests` + `funnel_events`), Active user trends (DAU/WAU/MAU from `audit_logs`).
- Add "Analytics" tab to AdminCRM page.

## Task 5: White-Label Branding Config (8B.3)

`usePlatformConfig` hook and `platform_config` table already exist.

- **DB Migration**: Ensure `platform_config` supports branding keys: `brand_name`, `brand_logo_url`, `brand_primary_color`, `brand_accent_color`, `custom_domain`.
- **New `src/hooks/useBrandConfig.ts`**: Reads branding keys from `platform_config`, provides defaults, applies CSS custom properties at app init.
- **New `src/components/admin/BrandingManager.tsx`**: Admin UI for logo upload, color pickers, brand name input, live preview. GlassPanel tokens.
- Add "Branding" tab to AdminCRM.

## Task 6: Bulk Operations (8B.4)

- **New `src/components/admin/BulkOperations.tsx`**: Multi-select table rows with checkbox column. Actions: batch approve/reject projects, bulk payout processing, CSV export. Confirmation dialog for destructive actions.
- **New `src/hooks/useBulkActions.ts`**: Batch mutation hook wrapping multiple Supabase updates in Promise.all with progress tracking.
- Integrate into AdminUsersHub and AdminRevenueHub as toolbar actions.

---

## Technical Notes

- All new components use `GlassPanel`/`HubHeader` design tokens, mobile-first at 375px
- `message_reactions` and challenge tables get RLS
- Fan Engagement Hub composes existing Day1/Fan hooks — no data duplication
- Bulk operations use confirmation dialogs for all destructive actions
- CSV export uses client-side generation (no edge function needed)

