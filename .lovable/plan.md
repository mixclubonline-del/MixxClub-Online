

# Notification & Messaging System — Audit Plan

## Current State

**In-app notifications**: Three separate `NotificationCenter` components exist (`src/components/NotificationCenter.tsx`, `src/components/notifications/NotificationCenter.tsx`, and `RealTimeNotifications.tsx` wrapping the first). Two different hooks serve them: `useNotifications` (Sheet-based, used in GlobalHeader) and a standalone version in `notifications/NotificationCenter.tsx` (Popover-based, used in Navigation). Both independently subscribe to realtime and query the same `notifications` table.

**Notification preferences**: Three separate systems — `NotificationPreferences` (stores JSON blob in `profiles.notification_preferences`), `NotificationPrefsPanel` (uses `notification_preferences` table via `useCRMNotificationPrefs`), and the CRM `NotificationsHub` preferences panel. None of them are consulted before creating or delivering notifications.

**Direct messaging**: `useDirectMessaging` hook fetches all messages (limit 1000) to build conversations client-side. No pagination. Realtime subscriptions in `MessagingHub` re-fetch the entire conversation on every new message instead of appending.

**Email**: Multiple edge functions send emails via raw Resend API calls with inline HTML templates (`send-welcome-email`, `send-payment-receipt`, `send-receipt-email`, `daily-digest`, `process-email-sequences`, `process-invite-wave`). No shared template system. All silently skip if `RESEND_API_KEY` is missing — no logging of failures.

## Gaps Found

| # | Issue | Impact |
|---|-------|--------|
| 1 | Three duplicate NotificationCenter components with independent realtime subscriptions | Triple channel subscriptions per user, inconsistent UX between nav contexts |
| 2 | Three notification preference systems that are never checked at delivery time | User toggles have zero effect — all notifications still created and shown |
| 3 | DM hook fetches 1000 messages to build conversations client-side; no pagination | Slow load times, will break as message volume grows |
| 4 | Realtime message handler re-fetches entire conversation instead of appending | Unnecessary DB round-trips on every incoming message |
| 5 | Email templates are inline HTML strings scattered across 6+ edge functions | No brand consistency, impossible to maintain, no failure tracking |
| 6 | No email delivery logging — all functions silently skip on missing API key | No visibility into whether emails are actually being sent |

## Plan

### 1. Consolidate NotificationCenter to single component
- Keep `src/components/NotificationCenter.tsx` (Sheet-based, richer UI with typed icons) as the canonical version
- Delete `src/components/notifications/NotificationCenter.tsx` (Popover-based duplicate)
- Update `Navigation.tsx` to import from `@/components/NotificationCenter` instead of `./notifications/NotificationCenter`
- `RealTimeNotifications.tsx` already wraps the correct one — no change needed
- Remove the now-empty `src/components/notifications/NotificationCenter.tsx` file

### 2. Wire notification preferences to delivery
- Create a `create_notification_checked` DB function that wraps `create_notification` but first checks the user's `notification_preferences` table for the matching category + `in_app` channel before inserting
- Update all trigger-based notification creators (`notify_project_milestone`, `notify_partnership_health_warning`, `notify_revenue_split_completed`, `notify_session_invitation`, etc.) to call `create_notification_checked` instead of `create_notification`
- Consolidate the two preference storage systems: migrate `profiles.notification_preferences` JSON blob users to `notification_preferences` table rows, then remove the JSON column approach from `NotificationPreferences.tsx` — have it use `useCRMNotificationPrefs` instead

### 3. Fix DM conversation loading with pagination
- Add server-side pagination to `fetchConversationMessages` — use `.range(offset, offset + limit)` instead of fetching all
- In `fetchConversations`, use the existing `get_conversations` DB function (already created in migration) instead of fetching 1000 messages and building conversations client-side
- Add "Load more" trigger in `MessagingHub` when scrolling to top of message list

### 4. Fix realtime message append
- In `MessagingHub.tsx` realtime handler, append the new message to `conversationMessages` state directly instead of calling `loadConversationMessages`
- Same fix in `useDirectMessaging.ts` — the realtime subscription should prepend to local state, not re-fetch

### 5. Create shared email template utility
- Create `supabase/functions/_shared/email-templates.ts` with a `renderEmailTemplate(templateName, data)` function that wraps content in a consistent branded layout (logo, colors, footer with unsubscribe)
- Refactor `send-welcome-email`, `send-payment-receipt`, `send-receipt-email`, and `daily-digest` to use the shared template renderer instead of inline HTML
- Add email send logging: after each Resend API call, insert a row into a lightweight `email_send_log` table (recipient, template_name, status, error_message, created_at)

### 6. Add email delivery logging table
- Migration: create `email_send_log` table (id, recipient_email, template_name, status, error_message, metadata, created_at)
- Update all email-sending edge functions to log success/failure after each Resend call
- When `RESEND_API_KEY` is missing, log with status `skipped` instead of silently returning

## Execution Order

```text
1. Consolidate NotificationCenter         (cleanup, no deps)
2. DM pagination + append fix             (independent)
3. Email template utility + logging table (independent)
4. Refactor edge functions to shared templates (depends on #3)
5. Wire notification preferences to delivery  (migration + trigger updates)
6. Consolidate preference UI                  (depends on #5)
```

## Files Created
- `supabase/functions/_shared/email-templates.ts`
- Migration SQL for `email_send_log` table + `create_notification_checked` function

## Files Modified
- `src/components/Navigation.tsx` — fix NotificationCenter import
- `src/hooks/useDirectMessaging.ts` — pagination, append instead of re-fetch
- `src/components/crm/messaging/MessagingHub.tsx` — append realtime messages, load-more
- `src/components/notifications/NotificationPreferences.tsx` — use `useCRMNotificationPrefs`
- `supabase/functions/send-welcome-email/index.ts` — shared template + logging
- `supabase/functions/send-payment-receipt/index.ts` — same
- `supabase/functions/send-receipt-email/index.ts` — same
- `supabase/functions/daily-digest/index.ts` — same

## Files Deleted
- `src/components/notifications/NotificationCenter.tsx`

