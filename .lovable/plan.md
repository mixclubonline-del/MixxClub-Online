

## Next Phase: Auth Wizard Stabilization & Unification

### Current State Summary
The wizard-style magic link authentication system (Phase 1) is now implemented with:
- ✅ `RoleStep` → Choose Producer/Artist/Engineer/Fan
- ✅ `EmailStep` → Enter email for magic link + Google OAuth fallback
- ✅ `ConfirmationStep` → Check inbox for magic link
- ✅ `AuthCallback` → Handles token exchange and role-based routing
- ✅ Routes configured (`/auth`, `/auth/callback`)
- ✅ Event propagation hardening (prevents refresh-on-type)

### What This Phase Delivers

**1. Unify Mobile Auth Entry Point**
The `MobileAuthDialog` component (used on `/mobile-landing`) still uses the legacy password-based flow. We need to redirect mobile users to the new wizard instead of showing a separate dialog.

Files affected:
- `src/pages/MobileLanding.tsx` - Replace dialog trigger with navigation to `/auth`
- `src/components/mobile/MobileAuthDialog.tsx` - Mark as deprecated or delete

**2. Add Social Proof to Wizard**
The existing `AuthSocialProof` component shows live activity and stats but isn't connected to the new wizard. We'll add it to the `RoleStep` for engagement.

Files affected:
- `src/components/auth/steps/RoleStep.tsx` - Add `AuthSocialProof` below role cards

**3. Polish Confirmation Step**
Add troubleshooting tips and ensure the resend cooldown is visible.

Files affected:
- `src/components/auth/steps/ConfirmationStep.tsx` - Already good, minor polish

**4. Cleanup Legacy Password References**
Remove password-related code from mobile auth while keeping DemoLogin intact (it's used for demo accounts).

---

### Implementation Details

**Step 1: Redirect Mobile Landing to /auth**
```text
MobileLanding.tsx changes:
- Remove MobileAuthDialog import and state
- Replace "Sign In" / "Sign Up" buttons with navigate('/auth')
```

**Step 2: Add Social Proof to RoleStep**
```text
RoleStep.tsx changes:
- Import AuthSocialProof
- Add below role cards, above Continue button
- Shows live activity + stats during signup
```

**Step 3: Deprecate MobileAuthDialog**
```text
Add deprecation comment:
// @deprecated Use /auth page with AuthWizard instead
// Kept for reference during migration
```

**Step 4: Verify DemoLogin Stays Functional**
The `DemoLogin.tsx` uses password auth for demo accounts - this is intentional and must remain unchanged.

---

### Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/MobileLanding.tsx` | Edit | Replace dialog with navigation to /auth |
| `src/components/auth/steps/RoleStep.tsx` | Edit | Add AuthSocialProof component |
| `src/components/mobile/MobileAuthDialog.tsx` | Edit | Add deprecation comment |

### Files Unchanged

| File | Reason |
|------|--------|
| `src/pages/DemoLogin.tsx` | Intentionally uses password auth for demo accounts |
| `src/pages/AudioUpload.tsx` | Uses password auth for temporary upload accounts |

---

### Acceptance Criteria

- [ ] Clicking "Sign In" on mobile landing navigates to /auth
- [ ] Role selection step shows live social proof stats
- [ ] Magic link sends successfully
- [ ] Clicking link in email signs user in
- [ ] New users route to role-specific onboarding
- [ ] Returning users route to their CRM hub
- [ ] Google OAuth still works as fallback
- [ ] No console errors or CSP blocks
- [ ] No page refresh on typing in fields

---

### Testing Plan

1. **Fresh signup flow**
   - Navigate to /auth
   - Select role (Producer)
   - Enter test email
   - Verify magic link email received
   - Click link → verify redirect to /producer-onboarding

2. **Returning user flow**
   - Navigate to /auth
   - Click "Sign in" to skip role selection
   - Enter existing email
   - Verify magic link works
   - Verify redirect to CRM (not onboarding)

3. **Google OAuth fallback**
   - Click Google button
   - Complete OAuth flow
   - Verify session established

4. **Mobile experience**
   - Open /auth on mobile viewport
   - Verify responsive design
   - Test touch interactions

---

### Risk Assessment

| Risk | Mitigation |
|------|------------|
| Magic link emails not delivered | Resend button with cooldown; troubleshooting tips in UI |
| OAuth redirect fails | CSP already updated to allow Lovable/Google domains |
| Session not persisting | AuthCallback exchanges tokens properly |
| Demo accounts break | DemoLogin.tsx left unchanged |

