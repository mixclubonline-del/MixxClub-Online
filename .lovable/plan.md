

## Add Admin Write RLS Policies

### Problem
The Admin CRM hubs have working read access, but every write action (assigning roles, removing roles, updating payout statuses, moderating content) will silently fail because no INSERT/UPDATE/DELETE policies exist for admin users on the relevant tables.

### What This Fixes

The AdminUsersHub already has `handleAssignRole` and `handleRemoveRole` functions wired to buttons. When you click "Add role" or click a role badge to remove it, those calls hit the database and get blocked by RLS. This migration unblocks them.

---

### Policies to Add (9 total)

**user_roles** (role assignment from Users Hub):
- Admin INSERT: assign any role to any user
- Admin DELETE: remove any role from any user

**profiles** (user management from Users Hub):
- Admin UPDATE: edit user profiles (e.g., ban, update info)

**collaboration_sessions** (session management from Sessions Hub):
- Admin UPDATE: change session status (cancel, complete)
- Admin DELETE: remove sessions

**audio_files** (content moderation from Content Hub):
- Admin UPDATE: flag or update audio file metadata
- Admin DELETE: remove violating audio files

**producer_beats** (content moderation from Content Hub):
- Admin UPDATE: flag or update beat metadata
- Admin DELETE: remove violating beats

**engineer_payouts** (payout processing from Revenue Hub):
- Admin UPDATE: mark payouts as processed/failed

**activity_feed** (community moderation from Community Hub):
- Admin DELETE: remove inappropriate activity entries

---

### Security Notes

- All policies use the same `has_role(auth.uid(), 'admin')` security definer function
- No new functions needed; the existing `has_role` function handles everything
- Only database-validated admin accounts can execute these writes
- The `user_roles` INSERT policy for admins is unrestricted on role type (admins can assign any role including admin)
- The existing user self-signup INSERT policy remains untouched (only allows artist/engineer self-assignment)

### No Code Changes

All frontend components are already wired for these operations. The `AdminUsersHub` has assign/remove handlers, the `PayoutProcessingControl` calls the edge function (which uses service role), and the System Hub already works via `admin_security_events` ALL policy. This is purely a database policy addition.

### Files Changed
- None (database migration only)

### Verification After Migration
1. Open Users Hub, assign a role to a user -- verify it sticks
2. Click a role badge to remove it -- verify it disappears
3. Check that non-admin users still cannot assign or remove roles

