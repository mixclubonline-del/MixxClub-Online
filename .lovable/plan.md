
# Complete Producer & Fan CRM Expansion - Remaining Work

## Current Build Error

The `ProactivePrimeBot` component has a type restriction that only accepts `'artist' | 'engineer'`, but `CRMPortal` now passes the userType which can be any of the 4 creation roles.

**Error Location:** `src/components/crm/CRMPortal.tsx` line 194
```typescript
<ProactivePrimeBot userType={userType} onNavigate={handleNavigate} />
```

---

## Remaining Implementation Tasks

### Task 1: Fix ProactivePrimeBot Type Error

Update `src/components/crm/ai/ProactivePrimeBot.tsx`:

```typescript
// Change the interface from:
interface ProactivePrimeBotProps {
  userType: 'artist' | 'engineer';
  onNavigate?: (path: string) => void;
}

// To:
interface ProactivePrimeBotProps {
  userType: 'artist' | 'engineer' | 'producer' | 'fan';
  onNavigate?: (path: string) => void;
}
```

Also update internal logic that references userType (e.g., lines 86-88 for project query) to handle producer and fan cases.

---

### Task 2: Update OnboardingPortal for New Roles

Update `src/components/onboarding/OnboardingPortal.tsx`:

```typescript
// Change role type from:
role: 'artist' | 'engineer';

// To:
role: 'artist' | 'engineer' | 'producer' | 'fan';
```

Update confetti colors and celebration messages for producer/fan.

---

### Task 3: Create Producer Onboarding Wizard

Create `src/components/onboarding/ProducerOnboardingWizard.tsx`:

**Steps:**
1. **Profile** - Producer name, username, bio
2. **Style** - Production genres (Trap, Boom Bap, Drill, etc.)
3. **Catalog** - Pricing preferences for beats
4. **Goals** - Sell beats, find artists, licensing

**Key Features:**
- Uses Tempo character guide (`characterId="tempo"`)
- Gold/amber accent colors
- Destination path: `/producer-crm`
- +125 XP on completion

---

### Task 4: Create Fan Onboarding Wizard

Create `src/components/onboarding/FanOnboardingWizard.tsx`:

**Steps (Lightweight - 2 steps):**
1. **Profile** - Display name, username
2. **Interests** - Favorite genres, discovery preferences

**Key Features:**
- Uses Nova character guide (`characterId="nova"`)
- Pink/magenta accent colors
- Destination path: `/fan-hub`
- +50 XP on completion (lower bar for fans)

---

### Task 5: Create Onboarding Page Routes

Create `src/pages/ProducerOnboarding.tsx`:
```typescript
import { ProducerOnboardingWizard } from "@/components/onboarding/ProducerOnboardingWizard";

export default function ProducerOnboarding() {
  return <ProducerOnboardingWizard />;
}
```

Create `src/pages/FanOnboarding.tsx`:
```typescript
import { FanOnboardingWizard } from "@/components/onboarding/FanOnboardingWizard";

export default function FanOnboarding() {
  return <FanOnboardingWizard />;
}
```

---

### Task 6: Add Routes to appRoutes.tsx

Add protected routes for new onboarding flows:
```typescript
<Route path="/onboarding/producer" element={<ProtectedRoute><ProducerOnboarding /></ProtectedRoute>} />
<Route path="/onboarding/fan" element={<ProtectedRoute><FanOnboarding /></ProtectedRoute>} />
```

---

### Task 7: Update Auth.tsx Role Selection

Expand role selection UI from 2 roles to 4:

```typescript
const ROLES = [
  { id: 'producer', label: 'Producer', icon: Disc3, description: 'I make beats', color: 'amber' },
  { id: 'artist', label: 'Artist', icon: Mic2, description: 'I make music', color: 'primary' },
  { id: 'engineer', label: 'Engineer', icon: Headphones, description: 'I mix & master', color: 'cyan' },
  { id: 'fan', label: 'Fan', icon: Heart, description: 'I discover & support', color: 'pink' },
];
```

Update `RolePathSelector` component to render a 2x2 grid with all 4 roles.

Update destination routing:
```typescript
const getOnboardingPath = (role: string) => {
  switch (role) {
    case 'producer': return '/onboarding/producer';
    case 'artist': return '/onboarding/artist';
    case 'engineer': return '/onboarding/engineer';
    case 'fan': return '/onboarding/fan';
    default: return '/onboarding/artist';
  }
};
```

Update login redirect logic to handle producer and fan roles:
```typescript
if (roles.includes('producer')) {
  destination = "/producer-crm";
} else if (roles.includes('engineer')) {
  destination = "/engineer-crm";
} else if (roles.includes('artist')) {
  destination = "/artist-crm";
} else if (roles.includes('fan')) {
  destination = "/fan-hub";
}
```

---

### Task 8: Update OnboardingWaypoints Variant Type

Update `src/components/onboarding/OnboardingWaypoints.tsx`:

```typescript
// Change variant type from:
variant?: 'artist' | 'engineer';

// To:
variant?: 'artist' | 'engineer' | 'producer' | 'fan';
```

Add color mappings for producer (gold) and fan (pink).

---

### Task 9: Update OnboardingPanel Variant Type

Update `src/components/onboarding/OnboardingPanel.tsx`:

```typescript
// Change variant type from:
variant?: 'artist' | 'engineer';

// To:
variant?: 'artist' | 'engineer' | 'producer' | 'fan';
```

Add styling for producer and fan variants.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/onboarding/ProducerOnboardingWizard.tsx` | Producer wizard with 4 steps |
| `src/components/onboarding/FanOnboardingWizard.tsx` | Fan wizard with 2 steps |
| `src/pages/ProducerOnboarding.tsx` | Producer onboarding page wrapper |
| `src/pages/FanOnboarding.tsx` | Fan onboarding page wrapper |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/crm/ai/ProactivePrimeBot.tsx` | Extend userType to 4 roles |
| `src/components/onboarding/OnboardingPortal.tsx` | Extend role type, add producer/fan celebration |
| `src/components/onboarding/OnboardingWaypoints.tsx` | Extend variant type |
| `src/components/onboarding/OnboardingPanel.tsx` | Extend variant type |
| `src/routes/appRoutes.tsx` | Add producer/fan onboarding routes |
| `src/pages/Auth.tsx` | Expand role selection to 4 roles, update routing |

---

## Implementation Order

1. **Fix Build Error** - Update ProactivePrimeBot to accept 4 roles
2. **Update Shared Components** - OnboardingPortal, OnboardingWaypoints, OnboardingPanel
3. **Create Producer Onboarding** - Wizard + page
4. **Create Fan Onboarding** - Wizard + page
5. **Add Routes** - appRoutes.tsx
6. **Update Auth** - Role selection UI expansion

This completes the full Producer & Fan expansion, enabling all 4 roles to sign up, onboard, and access their dedicated CRM experiences.
