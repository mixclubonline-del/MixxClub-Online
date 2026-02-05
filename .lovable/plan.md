
# Fix OAuth Authentication - Use Lovable Cloud Auth

## Problem

The OAuth sign-in (Google/Apple buttons) is not working because the `handleOAuthSignIn` function in `Auth.tsx` is calling `supabase.auth.signInWithOAuth()` directly instead of using the Lovable Cloud managed `lovable.auth.signInWithOAuth()`.

This bypasses the Lovable Cloud OAuth flow, causing authentication to fail.

---

## Root Cause

```text
Current (broken):
  Auth.tsx → supabase.auth.signInWithOAuth() → ❌ Fails

Required (correct):
  Auth.tsx → lovable.auth.signInWithOAuth() → ✅ Lovable Cloud handles OAuth
```

The `lovable.auth.signInWithOAuth()` function in `src/integrations/lovable/index.ts` is the correct method to use. It:
1. Handles the OAuth flow through Lovable Cloud
2. Sets the session on the Supabase client after successful auth
3. Returns proper error handling

---

## Fix

### File: `src/pages/Auth.tsx`

**Step 1:** Add import for lovable auth module

```typescript
import { lovable } from "@/integrations/lovable";
```

**Step 2:** Update `handleOAuthSignIn` function (lines 218-250)

```text
Replace:
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
      ...
    }
  });

With:
  const { error } = await lovable.auth.signInWithOAuth(provider, {
    redirect_uri: window.location.origin,
  });
```

---

## Full Updated Function

```typescript
const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
  setError("");
  setLoading(true);

  try {
    // Track OAuth attempt
    trackEvent('oauth_attempt', { provider, mode });
    
    // Use Lovable Cloud managed OAuth
    const { error } = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Don't set loading to false here as the redirect will happen
  } catch (err) {
    setError("Failed to sign in with " + provider);
    setLoading(false);
  }
};
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Auth.tsx` | Update | Add lovable import; replace `supabase.auth.signInWithOAuth` with `lovable.auth.signInWithOAuth` |

---

## Validation Steps

1. Navigate to `/auth` page
2. Click "Continue with Google" button
3. Complete Google OAuth flow
4. Verify redirect back to app with valid session
5. Repeat test with Apple sign-in button
