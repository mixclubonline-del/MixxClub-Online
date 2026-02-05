

# Fix Function Search Path Security Vulnerabilities
## Add `search_path` to 7 Database Functions

This migration addresses a SQL injection vector where attackers could exploit mutable search paths to intercept function calls.

---

## Security Issue

When a function doesn't explicitly set `search_path`, PostgreSQL uses the session's current search path. An attacker with the ability to modify session variables could:

1. Create malicious objects in a schema that appears earlier in the search path
2. Have the function inadvertently call the attacker's objects instead of the intended ones

The fix is to add `SET search_path TO 'public'` to lock each function to the public schema.

---

## Functions to Fix

| Function | Type | Risk Level |
|----------|------|------------|
| `get_or_create_wallet` | SECURITY DEFINER | HIGH - runs with elevated privileges |
| `increment_course_enrollments` | SECURITY DEFINER | HIGH - runs with elevated privileges |
| `calculate_recognition_tier` | IMMUTABLE | MEDIUM - pure function, limited attack surface |
| `generate_affiliate_code` | Regular | MEDIUM - generates sensitive codes |
| `check_and_reset_daily_limit` | Trigger | LOW - internal trigger |
| `update_updated_at_column` | Trigger | LOW - internal trigger |
| `update_wallet_timestamp` | Trigger | LOW - internal trigger |

---

## Implementation

### Database Migration

**File:** `supabase/migrations/[timestamp]_fix_function_search_paths.sql`

```sql
-- 1. get_or_create_wallet (SECURITY DEFINER - highest priority)
CREATE OR REPLACE FUNCTION public.get_or_create_wallet(p_user_id uuid)
 RETURNS mixx_wallets
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  wallet public.mixx_wallets;
BEGIN
  SELECT * INTO wallet FROM public.mixx_wallets WHERE user_id = p_user_id;
  
  IF wallet IS NULL THEN
    INSERT INTO public.mixx_wallets (user_id)
    VALUES (p_user_id)
    RETURNING * INTO wallet;
  END IF;
  
  RETURN wallet;
END;
$function$;

-- 2. increment_course_enrollments (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.increment_course_enrollments(p_course_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE courses 
  SET total_enrollments = COALESCE(total_enrollments, 0) + 1
  WHERE id = p_course_id;
END;
$function$;

-- 3. calculate_recognition_tier (IMMUTABLE)
CREATE OR REPLACE FUNCTION public.calculate_recognition_tier(follower_count integer)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  IF follower_count < 10 THEN
    RETURN 'before_day1';
  ELSIF follower_count < 100 THEN
    RETURN 'day1';
  ELSIF follower_count < 1000 THEN
    RETURN 'early_supporter';
  ELSE
    RETURN 'supporter';
  END IF;
END;
$function$;

-- 4. generate_affiliate_code
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'MIXX-';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$function$;

-- 5. check_and_reset_daily_limit (trigger)
CREATE OR REPLACE FUNCTION public.check_and_reset_daily_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.daily_purchased_reset_at < CURRENT_DATE THEN
    NEW.daily_purchased := 0;
    NEW.daily_purchased_reset_at := now();
  END IF;
  RETURN NEW;
END;
$function$;

-- 6. update_updated_at_column (trigger)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 7. update_wallet_timestamp (trigger)
CREATE OR REPLACE FUNCTION public.update_wallet_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
```

---

## Verification

After migration, running the security linter should show 0 "Function Search Path Mutable" warnings.

---

## Files Changed

| File | Action |
|------|--------|
| `supabase/migrations/[timestamp]_fix_function_search_paths.sql` | CREATE |

---

## Risk Assessment

- **Breaking Changes:** None - function signatures unchanged
- **Rollback:** Safe to rollback by removing `SET search_path TO 'public'` clause
- **Testing:** Existing functionality unaffected; verify wallet creation, course enrollment, and affiliate code generation still work

