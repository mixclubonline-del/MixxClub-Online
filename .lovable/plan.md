

# Admin CRM: The 110% Upgrade

## Overview

Five new hubs that transform your admin CRM from a monitoring panel into a true command center. Each one fills a critical gap for managing your first 100 users — and every one built to MixxClub's 120% standard with glass panels, skeleton loading states, and zero stubs.

## New Hubs

### 1. Support Inbox Hub
Read, triage, and respond to `contact_submissions` without leaving the admin.

- **Inbox view** with status filters (New / In Progress / Resolved) and search by name/email
- **Detail panel** — slide-over showing full message, budget, phone, submission date
- **Reply action** — sends email via existing Resend integration (new `admin-reply-contact` edge function)
- **Status management** — mark as in-progress, resolved, or flag for follow-up
- **Unread count badge** on the hub grid tile

### 2. Audit Log Viewer Hub
Searchable, filterable security timeline from the `audit_logs` table.

- **Filter bar** — by action type, user, date range, table name
- **Log timeline** — color-coded rows (red for `login_failed`, orange for `role_change`, green for standard)
- **Detail expand** — click any row to see old_data/new_data diff, IP, user agent
- **CSV export** — client-side download of filtered results
- **Suspicious activity badges** — auto-highlights patterns (5+ failed logins from same IP)

### 3. User Detail Drilldown
Click any user in the Users Hub to see their full story in a slide-over panel.

- **Profile header** — avatar, name, email, role badges, join date, level/XP
- **Tabbed sections**: Projects, Earnings, Sessions, Achievements, Activity, Partnerships
- **Quick actions** — assign role, send notification, view-as-role
- **Revenue summary** — total earned, total spent, subscription status

### 4. Partnership & Marketplace Oversight Hub
Monitor the revenue relationships and marketplace health.

- **Active partnerships** list with health scores from `partnership_health` table
- **Revenue splits** queue — pending splits needing admin attention
- **Marketplace transactions** — recent `marketplace_purchases` with buyer/seller/amount
- **Dispute flag** — surface any transactions with issues

### 5. Broadcast Notifications Hub
Announce features and engage early adopters directly from the admin.

- **Compose panel** — title, message, action URL, notification type
- **Audience selector** — all users, by role, or specific user IDs
- **Preview card** — see exactly what the notification looks like before sending
- **History log** — past broadcasts with delivery counts
- New `admin-broadcast-notification` edge function to bulk-insert into `notifications` table

## File Changes

### Create (8 files)
| File | Purpose |
|---|---|
| `src/components/admin/AdminSupportInbox.tsx` | Support inbox with status management and reply UI |
| `src/components/admin/AdminAuditLogViewer.tsx` | Filterable audit log timeline with export |
| `src/components/admin/AdminUserDetail.tsx` | User drilldown slide-over panel |
| `src/components/admin/AdminPartnershipsHub.tsx` | Partnership + marketplace oversight |
| `src/components/admin/AdminBroadcastHub.tsx` | Notification broadcaster with audience targeting |
| `supabase/functions/admin-reply-contact/index.ts` | Edge function: send reply email via Resend, update submission status |
| `supabase/functions/admin-broadcast-notification/index.ts` | Edge function: bulk-insert notifications for targeted audiences |
| `src/hooks/useAdminSupport.ts` | Hook for contact_submissions CRUD + reply actions |

### Edit (2 files)
| File | Change |
|---|---|
| `src/pages/AdminCRM.tsx` | Add 5 new cases to `renderContent()`, import new components |
| `src/components/crm/CRMHubGrid.tsx` | Add 5 new hub tiles to the admin hub definitions (Support, Audit, Partnerships, Broadcast, Analytics already exists) |

## Technical Notes

- **Resend** is already configured (`RESEND_API_KEY` exists) — reply emails work immediately
- Both new edge functions use `requireAdmin` from `_shared/auth.ts`
- User Detail is a `Sheet` (slide-over) triggered from `AdminUsersHub`, not a separate tab — keeps the Users hub contextual
- All hubs use `HubSkeleton` for loading and role-appropriate empty states per the 120% standard
- No new database tables needed — everything reads from existing tables
- Audit log viewer caps at 500 rows per query with pagination to stay within limits

