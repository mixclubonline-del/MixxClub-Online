
# Optimize Post-Signup Onboarding Flow

## Current State Analysis

The onboarding system has solid foundations but several optimization opportunities:

### Strengths
- Character-guided onboarding with Jax (Artist) and Rell (Engineer)
- Immersive cinematic visuals with parallax effects
- XP rewards for completion (+100 Artist / +150 Engineer)
- Username validation with real-time availability checking
- Celebration animations with confetti on completion

### Issues Identified

1. **No Auth Protection on Onboarding Routes**
   - `/onboarding/artist` and `/onboarding/engineer` are not protected
   - Unauthenticated users can access these pages and submit forms that fail

2. **No Onboarding Completion Tracking in Database**
   - Completion state stored only via XP award action type
   - No `onboarding_completed` boolean on profiles table
   - Users can accidentally repeat onboarding if they navigate directly

3. **Mobile Experience Gaps**
   - `MobileOnboardingWizard` is a stub showing "database schema updates required"
   - OnboardingWaypoints positioned at `bottom-32` can overlap with mobile navigation

4. **No Pre-Fill from Auth Data**
   - Email and full name from signup are not passed to onboarding
   - User has to re-enter name they just typed during signup

5. **Skip Flow UX Issues**
   - "Skip for now" goes directly to CRM without any confirmation
   - No indication of what's missed or how to complete later

6. **Missing Loading States**
   - No skeleton or loading indicator while user data is being fetched
   - `user` from `useAuth()` may be null initially causing silent failures

7. **Character Quote Timing**
   - Quotes are indexed by step number but don't match step content perfectly
   - Last step handoff to Prime happens before completion animation starts

---

## Implementation Plan

### Phase 1: Auth Protection & Data Persistence

**1.1 Add Route Protection**

Update `src/routes/appRoutes.tsx` to wrap onboarding routes with auth check:
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

<Route path="/onboarding/artist" element={
  <ProtectedRoute>
    <ArtistOnboarding />
  </ProtectedRoute>
} />
```

**1.2 Add `onboarding_completed` Column to Profiles**

Database migration:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
```

**1.3 Update Completion Handlers**

In `ArtistOnboardingWizard.tsx` and `EngineerOnboardingWizard.tsx`:
```tsx
// After profile update succeeds, mark onboarding complete
await supabase
  .from('profiles')
  .update({
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString()
  })
  .eq('id', user.id);
```

**1.4 Add Redirect Check in CRM**

In `ArtistCRM.tsx` / `EngineerCRM.tsx`:
```tsx
// If user hasn't completed onboarding, redirect them
if (!profile?.onboarding_completed && !profile?.username) {
  navigate('/onboarding/artist');
  return;
}
```

---

### Phase 2: Pre-Fill & Loading States

**2.1 Pass Email/Name from Auth**

Update `Auth.tsx` to include name in redirect:
```tsx
const destination = redirectPath 
  ? redirectPath 
  : (role === "engineer" 
    ? `/onboarding/engineer?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}`
    : `/onboarding/artist?name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}`);
```

**2.2 Read URL Params in Onboarding Wizards**

```tsx
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();
const nameFromUrl = searchParams.get('name');
const emailFromUrl = searchParams.get('email');

// Initialize form state with these values
const [fullName, setFullName] = useState(nameFromUrl || '');
```

**2.3 Add Loading Skeleton**

Create loading state while checking auth:
```tsx
if (!user) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
```

---

### Phase 3: Mobile Optimization

**3.1 Responsive Waypoints Positioning**

Update `OnboardingWaypoints.tsx`:
```tsx
<div className="absolute bottom-32 max-md:bottom-20 left-0 right-0 px-8 max-md:px-4">
```

**3.2 Compact Panel on Mobile**

Update `OnboardingPanel.tsx`:
```tsx
<div className="flex-1 flex items-center justify-center px-4 py-8 max-md:py-4 max-md:px-3">
  <motion.div className="w-full max-w-lg max-md:max-w-full">
```

**3.3 Hide Character Guide on Small Screens**

Update `OnboardingCharacterGuide.tsx`:
```tsx
className={cn(
  'fixed bottom-6 left-6 z-50',
  'max-sm:hidden', // Hide on phones to prevent overlap
  className
)}
```

---

### Phase 4: Skip Flow Improvements

**4.1 Add Confirmation Dialog for Skip**

```tsx
import { AlertDialog } from '@/components/ui/alert-dialog';

const [showSkipConfirm, setShowSkipConfirm] = useState(false);

const handleSkipClick = () => setShowSkipConfirm(true);

const handleConfirmSkip = () => {
  toast.info("You can complete your profile anytime from Settings", {
    duration: 5000,
    action: {
      label: "Go to Settings",
      onClick: () => navigate('/settings/profile')
    }
  });
  navigate(destinationPath);
};
```

**4.2 Add "Complete Later" Reminder in CRM**

Create `OnboardingReminder.tsx`:
```tsx
export function OnboardingReminder() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  
  // Show gentle reminder banner if profile incomplete
  if (dismissed || profile?.onboarding_completed) return null;
  
  return (
    <div className="bg-primary/10 border-l-4 border-primary p-4 mb-4">
      <p>Complete your profile to unlock all features</p>
      <Button onClick={() => navigate('/onboarding/artist')}>
        Continue Setup
      </Button>
    </div>
  );
}
```

---

### Phase 5: Character Quote Refinement

**5.1 Update Character Quotes in Config**

Update `src/config/characters.ts` with step-specific quotes:

```tsx
// Jax (Artist)
onboardingQuotes: [
  "Your name is your brand. Claim it.",           // Profile step
  "Hip-hop, R&B, Drill... what's in your DNA?",   // Genre step
  "Goals locked. Let's get you in the mix.",      // Goals step (final)
]

// Rell (Engineer)
onboardingQuotes: [
  "Build your profile. Let the work speak.",      // Profile step
  "Mixing, mastering, sound design... stack it.", // Skills step
  "Know your worth. Set your price.",             // Rates step (final)
]
```

**5.2 Add Prime Handoff Quote**

Add separate handoff logic:
```tsx
const isCompletingStep = isLastStep && isSubmitting;
const showPrimeHandoff = isCompletingStep;

// Show Prime's welcome when transitioning
const handoffQuote = "Welcome to the club. Let's get legendary.";
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/routes/appRoutes.tsx` | Wrap onboarding routes with ProtectedRoute |
| `src/pages/Auth.tsx` | Pass name/email to onboarding via URL params |
| `src/components/onboarding/ArtistOnboardingWizard.tsx` | Pre-fill form, add loading state, update completion handler |
| `src/components/onboarding/EngineerOnboardingWizard.tsx` | Pre-fill form, add loading state, update completion handler |
| `src/components/onboarding/OnboardingPanel.tsx` | Add skip confirmation, mobile responsive styles |
| `src/components/onboarding/OnboardingWaypoints.tsx` | Mobile-safe positioning |
| `src/components/characters/OnboardingCharacterGuide.tsx` | Hide on small screens |
| `src/config/characters.ts` | Refine step-specific quotes |
| `src/pages/ArtistCRM.tsx` | Add incomplete onboarding redirect |
| Database migration | Add `onboarding_completed` column to profiles |

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/components/crm/OnboardingReminder.tsx` | Banner for incomplete profiles |

---

## Testing Checklist

1. **Auth Protection**: Verify unauthenticated users are redirected to `/auth` from onboarding routes
2. **Pre-Fill**: Confirm name entered during signup appears pre-filled in onboarding form
3. **Mobile Layout**: Test on 375px viewport; waypoints and panel should not overlap navigation
4. **Skip Flow**: Verify confirmation dialog appears and reminder banner shows in CRM
5. **Completion Tracking**: Check `onboarding_completed` is set to `true` in database after completion
6. **Duplicate Prevention**: Navigate directly to `/onboarding/artist` after completing—should redirect to CRM
7. **Character Quotes**: Verify quotes match the current step content

---

## Technical Notes

- The `profiles` table already has `role` column—onboarding updates this correctly
- `award_points` RPC handles XP—no changes needed there
- `useUsernameValidation` hook is well-designed with debouncing and format validation
- `OnboardingPortal` handles celebration animation and navigation after 2s delay
- Existing `ProtectedRoute` component should be used for consistency
