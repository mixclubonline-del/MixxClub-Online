

## New Authentication Page: Wizard-Style Magic Link Flow

### Goal

Replace the current 1,170-line monolithic `Auth.tsx` with a clean, modular wizard-style authentication experience using passwordless magic links.

### Why This Approach

1. **Magic Link Benefits**
   - No passwords to forget or manage
   - Inherently more secure (no credential stuffing attacks)
   - Modern UX pattern used by Slack, Notion, Linear
   - Simpler form (just email + role selection)

2. **Wizard Flow Benefits**
   - Guided experience reduces cognitive load
   - Step-by-step progression is mobile-friendly
   - Easier to add future steps (e.g., profile setup)
   - Cleaner separation of concerns

3. **Current Issues Being Resolved**
   - Refresh-on-interaction bug (from stale PWA/global handlers)
   - 1,170+ lines in single file (unmaintainable)
   - Complex state management mixing login/signup/reset/update-password modes
   - Framer Motion layout conflicts

---

### Architecture

```text
src/
├── pages/
│   ├── Auth.tsx                    # NEW: Lightweight wizard container
│   └── AuthCallback.tsx            # NEW: Magic link callback handler
├── components/auth/
│   ├── steps/
│   │   ├── RoleStep.tsx            # Step 1: Choose your path
│   │   ├── EmailStep.tsx           # Step 2: Enter email
│   │   └── ConfirmationStep.tsx    # Step 3: Check your inbox
│   ├── AuthWizard.tsx              # Wizard controller
│   ├── AuthLayout.tsx              # Gateway visual wrapper
│   └── AuthSocialProof.tsx         # KEEP (existing)
└── hooks/
    └── useAuthWizard.ts            # Wizard state management
```

---

### Wizard Steps

**Step 1: Choose Your Path (Role Selection)**
- Four role cards: Producer, Artist, Engineer, Fan
- Visual selection with role-specific icons and taglines
- Progress indicator: Step 1 of 3

**Step 2: Enter Email**
- Single email input field
- "Send Magic Link" button
- Google OAuth as alternative (below separator)
- Progress indicator: Step 2 of 3

**Step 3: Check Your Inbox**
- Animated confirmation with envelope icon
- Clear instruction: "Click the link in your email"
- Resend link option (with 60-second cooldown)
- Change email option (goes back to Step 2)

**Returning User Flow**
- Skip Step 1 (role selection)
- Show "Welcome back" instead of "Enter the City"
- Same magic link flow

---

### Technical Implementation

**1. Magic Link Auth (Supabase)**
```typescript
// Sign in/up with magic link
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    shouldCreateUser: true, // Allow new signups
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    data: {
      role: selectedRole,
      full_name: '', // Collected in onboarding
    }
  }
});
```

**2. Callback Handler (AuthCallback.tsx)**
- Handles magic link redirect
- Exchanges token for session
- Assigns role to `user_roles` table
- Redirects to role-specific onboarding

**3. Wizard State (useAuthWizard.ts)**
```typescript
interface AuthWizardState {
  step: 'role' | 'email' | 'confirmation';
  mode: 'signup' | 'login';
  selectedRole: AppRole | null;
  email: string;
  loading: boolean;
  error: string | null;
  resendCooldown: number;
}
```

**4. Visual Layout (AuthLayout.tsx)**
- Reuses existing `auth-gateway.jpg` background
- Glass-morphism card containing wizard steps
- Ambient particles (CSS-based, no Framer layout animations)
- Safe area insets for mobile
- Back button to landing

---

### Form Hardening

All inputs and buttons will include:
- `onKeyDownCapture={(e) => e.stopPropagation()}` to prevent global shortcut interference
- `type="button"` on all non-submit buttons
- `e.preventDefault()` on form submission
- No Framer Motion `layout` animations on interactive elements

---

### Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| DELETE | `src/pages/Auth.tsx` | Remove current 1,170-line file |
| CREATE | `src/pages/Auth.tsx` | New lightweight wizard container (~100 lines) |
| CREATE | `src/pages/AuthCallback.tsx` | Magic link callback handler (~80 lines) |
| CREATE | `src/components/auth/AuthWizard.tsx` | Wizard state + step renderer (~150 lines) |
| CREATE | `src/components/auth/AuthLayout.tsx` | Visual wrapper with background (~80 lines) |
| CREATE | `src/components/auth/steps/RoleStep.tsx` | Role selection cards (~100 lines) |
| CREATE | `src/components/auth/steps/EmailStep.tsx` | Email input + Google OAuth (~120 lines) |
| CREATE | `src/components/auth/steps/ConfirmationStep.tsx` | Check inbox UI (~80 lines) |
| CREATE | `src/hooks/useAuthWizard.ts` | Wizard state hook (~100 lines) |
| MODIFY | `src/routes/index.tsx` | Add `/auth/callback` route |
| KEEP | `src/components/auth/AuthSocialProof.tsx` | Reuse existing component |
| KEEP | `src/components/auth/ProtectedRoute.tsx` | No changes needed |

---

### Edge Cases Handled

1. **User already exists (login vs signup)**
   - Magic link works for both
   - Backend detects existing user, skips role assignment
   - Redirects to CRM instead of onboarding

2. **Email not delivered**
   - Resend button with 60-second cooldown
   - Toast with troubleshooting tips (check spam)

3. **Session recovery**
   - `AuthCallback.tsx` handles token exchange
   - Falls back to login if token expired

4. **Google OAuth fallback**
   - Kept as alternative for users who prefer it
   - Uses existing `lovable.auth.signInWithOAuth`

5. **Password reset users**
   - Removed (no passwords = no reset needed)
   - Existing reset links will still work via Supabase

---

### Migration Path

1. New auth system built alongside old
2. Old `Auth.tsx` renamed to `Auth.legacy.tsx` temporarily
3. New `Auth.tsx` takes over `/auth` route
4. After validation, delete legacy file

---

### Acceptance Criteria

- Typing in email field does not refresh page
- Magic link sends successfully
- Clicking link in email signs user in
- New users go to role-specific onboarding
- Returning users go to their CRM hub
- Google OAuth still works
- Works on desktop Chrome, mobile Safari, mobile Chrome
- No console errors or CSP blocks

