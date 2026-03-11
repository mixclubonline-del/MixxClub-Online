

# Push Notifications System — Partnership Event Notifications

## Overview

Wire real-time partnership events (milestone completion, payment received, health score warning) into the existing notification infrastructure. The `send-push-notification` edge function and `NotificationsHub` UI already exist — this phase connects partnership database changes to them via a new hook and database triggers.

## Current State

- **`send-push-notification`** edge function: fully built with FCM push, email via Resend, and DB notification insert
- **`NotificationsHub`**: real-time subscription on `notifications` table with category filtering (partnerships, payments, projects, messages)
- **`useCrossHubSync`**: listens to hubEventBus events but does NOT write to the `notifications` table
- **Missing**: No database triggers or client-side logic that creates notification rows when partnership events occur (milestone hit, payment completed, health drop)

## Changes

### 1. Database Migration — Partnership Event Triggers

Create 3 triggers that auto-insert notification rows:

**a. Milestone completed trigger** — on `collaborative_projects` milestone columns or a milestone tracker update, insert a notification for both partners when a project milestone is reached.

**b. Revenue split completed trigger** — on `revenue_splits` status change to `completed`, notify the payee with amount and project details.

**c. Partnership health warning trigger** — on `partnership_health` update, if `health_score` drops below 60, insert a warning notification for both partners.

All triggers use `SECURITY DEFINER` with `search_path = 'public'` and call the existing `create_notification()` function.

### 2. New Hook: `src/hooks/usePartnershipNotifications.ts` (~80 lines)

Client-side hook that:
- Subscribes to Supabase Realtime on `collaborative_projects`, `revenue_splits`, and `partnership_health` tables filtered by user
- On relevant changes, publishes to `hubEventBus` (e.g., `milestone:completed`, `revenue:received`)
- Fires `sonner` toast with action button linking to the relevant project/partnership
- Optionally calls `send-push-notification` edge function for high-priority events (payment received, health critical)

### 3. Wire Hook into CRM Layouts

Import `usePartnershipNotifications(user?.id)` in:
- `src/pages/ArtistCRM.tsx`
- `src/pages/ProducerCRM.tsx`  
- `src/pages/EngineerCRM.tsx`

Single line addition in each file — the hook self-manages subscriptions.

### 4. Enhance `NotificationsHub` Category Config (~10 lines)

Add a `health` category to `categoryConfig`:
```
health: { icon: AlertTriangle, label: 'Health', types: ['health_warning', 'health_critical'] }
```

Add health-specific icon/color mapping to `getNotificationIcon` and `getNotificationColor`.

### 5. Update `useCrossHubSync.ts` (~15 lines)

Wire the existing `milestone:completed` and `revenue:received` hub event handlers to call `send-push-notification` edge function for the partner user (the one who didn't trigger the event), ensuring push + email delivery.

## Files Summary

| File | Action |
|------|--------|
| Database migration | Create 3 partnership notification triggers |
| `src/hooks/usePartnershipNotifications.ts` | Create — real-time partnership event listener |
| `src/pages/ArtistCRM.tsx` | Edit — add hook call |
| `src/pages/ProducerCRM.tsx` | Edit — add hook call |
| `src/pages/EngineerCRM.tsx` | Edit — add hook call |
| `src/components/crm/notifications/NotificationsHub.tsx` | Edit — add health category |
| `src/hooks/useCrossHubSync.ts` | Edit — wire push notifications for partner events |

