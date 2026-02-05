

# Fix Post-Signup Error Message on Successful Signup

## Root Cause Analysis

The error message "An unexpected error occurred. Please try again." appears after successful signup due to **an unhandled exception in the generic catch block** at lines 450-455 of `Auth.tsx`.

### The Problem Flow

```text
1. User submits signup form
2. supabase.auth.signUp() succeeds → returns data.user
3. Role insertion to user_roles table succeeds (201 response)
4. trackSignup('email') is called
5. toast.success() shows "Account created!"
6. triggerEntryAnimation() is called
7. ⚠️ Some async operation throws an exception
8. catch block catches it and displays generic error
```

### Likely Culprits

1. **`trackSignup('email')` throwing silently** — The analytics service calls `console.log` in dev mode which shouldn't throw, but if there's any issue with the internal queue or unexpected state, it could throw.

2. **`triggerEntryAnimation()` timing issue** — This function sets state (`setEnteringCity(true)`) and schedules a navigation after 1000ms. If the component unmounts before the timeout completes (e.g., due to auth state change), it could cause issues.

3. **Auth state listener race condition** — The `useAuth` hook's `onAuthStateChange` listener triggers role fetching via `fetchUserRoles()`. This runs asynchronously with a `setTimeout(..., 0)` wrapper. If the signup flow completes and the component tries to navigate while role fetching is in progress, the component may unmount and cause navigation conflicts.

4. **Zod validation on edge case** — If `validationData` contains unexpected properties after signup succeeds, the catch block would fire with a non-ZodError exception.

---

## Solution

### Fix 1: Wrap post-signup operations in try-catch

Isolate the role insertion and analytics tracking to prevent any failures in these secondary operations from triggering the generic error message.

**File:** `src/pages/Auth.tsx`
**Lines:** 382-403

```tsx
// Current (problematic)
if (data.user) {
  const roleToInsert = role === "artist" ? "artist" : "engineer";
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: data.user.id, role: roleToInsert });
  
  if (roleError) {
    console.error('Failed to assign role:', roleError);
  }
  
  // Track signup
  trackSignup('email');
}

toast.success("Account created! Entering the city...");

// Entry animation then navigate
const destination = redirectPath 
  ? redirectPath 
  : (role === "engineer" ? "/onboarding/engineer" : "/onboarding/artist");
triggerEntryAnimation(destination);
```

```tsx
// Fixed (wrapped in isolated try-catch)
if (data.user) {
  // Perform role assignment in isolated try-catch
  // This should not block signup success
  try {
    const roleToInsert = role === "artist" ? "artist" : "engineer";
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: data.user.id, role: roleToInsert });
    
    if (roleError) {
      console.error('Failed to assign role:', roleError);
    }
  } catch (roleErr) {
    console.error('Role assignment failed:', roleErr);
  }
  
  // Track signup in isolated block
  try {
    trackSignup('email');
  } catch (analyticsErr) {
    console.warn('Analytics tracking failed:', analyticsErr);
  }
}

toast.success("Account created! Entering the city...");

// Entry animation then navigate
const destination = redirectPath 
  ? redirectPath 
  : (role === "engineer" ? "/onboarding/engineer" : "/onboarding/artist");
triggerEntryAnimation(destination);
```

### Fix 2: Guard the entry animation timeout

Prevent navigation if component unmounts during the animation delay.

**File:** `src/pages/Auth.tsx`
**Lines:** 341-346

```tsx
// Current
const triggerEntryAnimation = (destination: string) => {
  setEnteringCity(true);
  setTimeout(() => {
    navigate(destination);
  }, 1000);
};
```

```tsx
// Fixed with cleanup ref
import { useRef } from "react";

// Inside component:
const isMounted = useRef(true);

useEffect(() => {
  isMounted.current = true;
  return () => {
    isMounted.current = false;
  };
}, []);

const triggerEntryAnimation = (destination: string) => {
  setEnteringCity(true);
  setTimeout(() => {
    if (isMounted.current) {
      navigate(destination);
    }
  }, 1000);
};
```

### Fix 3: Add specific error logging to catch block

Improve debugging by logging the actual error before displaying the generic message.

**File:** `src/pages/Auth.tsx`
**Lines:** 450-455

```tsx
// Current
} catch (err) {
  if (err instanceof z.ZodError) {
    setError(err.issues[0].message);
  } else {
    setError("An unexpected error occurred. Please try again.");
  }
}
```

```tsx
// Fixed with logging
} catch (err) {
  if (err instanceof z.ZodError) {
    setError(err.issues[0].message);
  } else {
    console.error('Auth error:', err);
    // Check if it's a known error type with a message
    const errorMessage = err instanceof Error ? err.message : String(err);
    // Only show generic message if we can't extract a meaningful one
    if (errorMessage && errorMessage !== '[object Object]') {
      setError(parseAuthError({ message: errorMessage }));
    } else {
      setError("An unexpected error occurred. Please try again.");
    }
  }
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | 1. Wrap role insertion + analytics in isolated try-catch blocks<br>2. Add mounted ref guard for animation timeout<br>3. Improve error logging in catch block |

---

## Testing Plan

1. Create a new test account via the signup form
2. Verify the toast shows "Account created!" without the error message appearing
3. Verify navigation to onboarding page completes smoothly
4. Check console for any logged errors that were silently caught
5. Test on mobile viewport to ensure MobileBottomNav doesn't interfere

