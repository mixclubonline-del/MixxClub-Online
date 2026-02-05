
# Fix User Roles INSERT Policy for Signup

## Problem

During email/password signup, the flow fails with a `403 Forbidden` error when trying to insert into `user_roles`:

```
POST /rest/v1/user_roles → 403 Forbidden
```

**Root Cause:** The `user_roles` table has RLS enabled but only has a SELECT policy. There is no INSERT policy, so authenticated users cannot assign themselves a role during signup.

---

## Current RLS Policies on `user_roles`

| Policy Name | Command | Condition |
|-------------|---------|-----------|
| Users can view own roles | SELECT | `auth.uid() = user_id` |
| *(missing)* | INSERT | *(none)* |

---

## Security Considerations

The INSERT policy must:
1. Only allow users to insert roles for themselves (`user_id = auth.uid()`)
2. Restrict insertable roles to `artist` and `engineer` only (prevent `admin` privilege escalation)
3. Prevent duplicate role assignments (already handled by table's UNIQUE constraint)

---

## Solution

### Database Migration

Add an INSERT policy with security constraints:

```sql
-- Allow authenticated users to insert their own role during signup
-- Restricted to 'artist' and 'engineer' roles only (no admin self-assignment)
CREATE POLICY "Users can insert own role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role IN ('artist'::app_role, 'engineer'::app_role)
);
```

---

## Why This Is Secure

1. **Self-only insertion**: `auth.uid() = user_id` ensures users can only create roles for themselves
2. **No admin escalation**: `role IN ('artist', 'engineer')` blocks users from granting themselves admin privileges
3. **Server-side enforcement**: RLS runs at the database level, not client-side
4. **Unique constraint**: Table already has `UNIQUE (user_id, role)` preventing duplicate roles

---

## Migration Summary

| Table | Action | Policy Name | Security |
|-------|--------|-------------|----------|
| `user_roles` | Add INSERT policy | "Users can insert own role during signup" | Self-only + non-admin roles |

---

## Validation Steps

After migration:
1. Navigate to `/auth` and select "Sign Up"
2. Enter test email, password, and select a role (Artist or Engineer)
3. Submit the form
4. Verify no 403 error in console
5. Check `user_roles` table for the new entry
6. Attempt to manually insert `admin` role via console — should be blocked by policy
