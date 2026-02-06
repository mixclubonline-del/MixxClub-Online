

## Fix Admin CRM: Add Missing RLS Policies

### Problem
The Admin CRM is fully built and correctly wired, but 6 database tables lack admin-level SELECT policies. This means the admin dashboard shows incomplete or empty data in the Users, Sessions, Content, Revenue, and Community hubs.

### Root Cause
When these tables were created, only user-scoped policies were added (e.g., "view own data" or "view public data"). No admin override policies exist for bulk data access.

### Database Migration

Add 6 new RLS policies using the existing `has_role` security definer function:

```text
Table: user_roles
Policy: "Admins can view all user roles"
Rule: SELECT where has_role(auth.uid(), 'admin')

Table: collaboration_sessions  
Policy: "Admins can view all sessions"
Rule: SELECT where has_role(auth.uid(), 'admin')

Table: audio_files
Policy: "Admins can view all audio files"
Rule: SELECT where has_role(auth.uid(), 'admin')

Table: producer_beats
Policy: "Admins can view all beats"
Rule: SELECT where has_role(auth.uid(), 'admin')

Table: engineer_payouts
Policy: "Admins can view all payouts"
Rule: SELECT where has_role(auth.uid(), 'admin')

Table: activity_feed
Policy: "Admins can view all activity"
Rule: SELECT where has_role(auth.uid(), 'admin')
```

All policies use the existing `has_role` security definer function, which queries `user_roles` without triggering RLS recursion.

### Why This Is Safe

- The `has_role` function is `SECURITY DEFINER` -- it bypasses RLS on the `user_roles` table itself, preventing circular policy checks.
- Only users with the `admin` role in `user_roles` can access this data.
- No client-side bypass is possible; the check runs server-side in Postgres.

### No Code Changes Required

All frontend components (AdminCRM, hub components, AdminRoute) are already correctly built. This is purely a database policy fix.

### Files Changed
- None (database migration only)

### Verification Steps After Migration
1. Sign in with mixclubonline@gmail.com
2. Navigate to /admin
3. Confirm Dashboard shows total user count, role distribution, and recent activity
4. Open Users hub -- verify all users appear with their role badges
5. Open Sessions hub -- verify all sessions (including private) appear
6. Open Content hub -- verify audio files and beats from all users appear
7. Open Revenue hub -- verify payouts section shows data
8. Open Community hub -- verify full activity feed loads

