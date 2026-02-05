
# Add Autocomplete Attributes to Auth Form Inputs

## Background

Browser console warnings recommend adding `autocomplete` attributes to form inputs to improve autofill UX and eliminate "Input elements should have autocomplete attributes" warnings.

---

## Files to Update

### 1. `src/pages/Auth.tsx`

| Location | Input Type | Autocomplete Value |
|----------|------------|-------------------|
| Line 630 | New Password | `autocomplete="new-password"` |
| Line 648 | Confirm Password | `autocomplete="new-password"` |
| Line 820 | Reset Email | `autocomplete="email"` |
| Line 898 | Full Name (signup) | `autocomplete="name"` |
| Line 916 | Email | `autocomplete="email"` |
| Line 930 | Password | `autocomplete="current-password"` (login) or `autocomplete="new-password"` (signup) |

### 2. `src/components/mobile/MobileAuthDialog.tsx`

| Location | Input Type | Autocomplete Value |
|----------|------------|-------------------|
| Line 161 | Reset Email | `autocomplete="email"` |
| Line 200 | Email | `autocomplete="email"` |
| Line 209 | Password | `autocomplete="current-password"` (login) or `autocomplete="new-password"` (signup) |

---

## Autocomplete Attribute Reference

| Scenario | Attribute Value |
|----------|-----------------|
| User signing in | `autocomplete="current-password"` |
| User creating account | `autocomplete="new-password"` |
| Email field | `autocomplete="email"` |
| Full name field | `autocomplete="name"` |
| Password reset (new) | `autocomplete="new-password"` |

---

## Code Changes

### Auth.tsx - Password Reset Form (lines 630, 648)
```tsx
<Input
  id="password"
  type="password"
  autocomplete="new-password"
  ...
/>
<Input
  id="confirmPassword"
  type="password"
  autocomplete="new-password"
  ...
/>
```

### Auth.tsx - Main Form (lines 898, 916, 930)
```tsx
<Input
  id="fullName"
  type="text"
  autocomplete="name"
  ...
/>
<Input
  id="email"
  type="email"
  autocomplete="email"
  ...
/>
<Input
  id="password"
  type="password"
  autocomplete={mode === "signup" ? "new-password" : "current-password"}
  ...
/>
```

### MobileAuthDialog.tsx (lines 161, 200, 209)
```tsx
<Input
  type="email"
  autocomplete="email"
  ...
/>
<Input
  type="password"
  autocomplete={authMode === "signup" ? "new-password" : "current-password"}
  ...
/>
```

---

## Validation

1. Open browser console on `/auth` page
2. Verify no "autocomplete" warnings appear
3. Test password manager autofill works correctly for:
   - Login flow
   - Signup flow
   - Password reset flow
4. Test on mobile auth dialog as well
