
# Fabric Flow Spine Migration - Batch 4
## Hooks, Dashboard, and Component Layer Migration

### Overview

**Batch Scope:** Migrate remaining ~70 files from direct `useNavigate()` usage to the Fabric Flow Intent system  
**Current Progress:** ~55/126 files migrated (~44%)  
**Files in This Batch:** 15 high-priority files across hooks, dashboard, and utility components

---

### Files to Migrate in This Batch

#### Priority 1: Core Pages (3 files)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/pages/Dashboard.tsx` | auth redirect, role-based CRM redirect | `goToAuth()`, `openArtistCRM()`, `openEngineerCRM()` |
| `src/pages/LivePage.tsx` | unused import (cleanup) | Remove unused `useNavigate` |
| `src/components/HowItWorks.tsx` | signup redirect | `goToAuth('signup')` |

#### Priority 2: Home Components (5 files)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/components/home/SmartBudgetQualifier.tsx` | auth redirect after matching | `goToAuth('login')` |
| `src/components/home/UserJourneys.tsx` | role-based routes | `navigateTo()` |
| `src/components/home/RoleSelectionCTA.tsx` | auth + onboarding routes | `goToAuth('signup')` |
| `src/components/home/TierShowcase.tsx` | pricing page | `openPricing()` |
| `src/components/home/SimplePackagePreview.tsx` | pricing page | `openPricing()` |

#### Priority 3: Studio & Scene (2 files)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/components/studio/StudioHub.tsx` | session routes, studio routes | `navigateTo()` |
| `src/components/scene/StudioHallway.tsx` | session navigation | `navigateTo('/session/${id}')` |

#### Priority 4: Dashboard & CRM (3 files)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/components/crm/dashboard/EnhancedDashboardHub.tsx` | tab navigation within CRM | `navigateTo()` for query params |
| `src/components/profile/FollowersList.tsx` | user profile navigation | `navigateTo('/u/${username}')` |
| `src/components/FreemiumBanner.tsx` | pricing page | `openPricing()` |

#### Priority 5: Onboarding & Layout (2 files)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/components/onboarding/EngineerOnboardingWizard.tsx` | CRM redirect after completion | `openEngineerCRM()` |
| `src/components/onboarding/OnboardingPortal.tsx` | destination redirect | `navigateTo(destinationPath)` |

---

### Technical Implementation

#### Pattern Replacement Examples

```typescript
// Dashboard.tsx - Role-based redirect
// Before
if (profile.role === 'engineer') {
  navigate('/engineer-crm');
} else if (profile.role === 'client') {
  navigate('/artist-crm');
}

// After
if (profile.role === 'engineer') {
  openEngineerCRM();
} else if (profile.role === 'client') {
  openArtistCRM();
}
```

```typescript
// SmartBudgetQualifier.tsx - Auth redirect
// Before
const handleComplete = () => {
  onOpenChange(false);
  navigate('/auth');
};

// After
const { goToAuth } = useFlowNavigation();
const handleComplete = () => {
  onOpenChange(false);
  goToAuth('login');
};
```

```typescript
// StudioHallway.tsx - Session navigation
// Before
if (room.visibility === 'public' && room.sessionId) {
  navigate(`/session/${room.sessionId}`);
}

// After
if (room.visibility === 'public' && room.sessionId) {
  navigateTo(`/session/${room.sessionId}`);
}
```

---

### Import Replacement Pattern

For each file:
```typescript
// Remove
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();

// Add
import { useFlowNavigation } from '@/core/fabric/useFlow';
const { navigateTo, goToAuth, openArtistCRM, openEngineerCRM, openPricing } = useFlowNavigation();
```

---

### Special Handling Notes

1. **Dashboard.tsx**: This file uses navigate in a `useEffect` for auth/role checking. The flow hook is already reactive to auth changes, but we still need to use the semantic methods.

2. **LivePage.tsx**: The `useNavigate` import is unused - simply remove it.

3. **EnhancedDashboardHub.tsx**: Uses `navigate('?tab=...')` for query param changes within the same page. This should use `navigateTo('?tab=...')`.

4. **OnboardingPortal.tsx**: Uses navigate in a completion callback. Replace with `navigateTo(destinationPath)`.

5. **StudioHallway.tsx**: Dynamic session ID navigation - use template literal with `navigateTo()`.

---

### Expected Outcome

After this batch:
- **70/126 files migrated** (~56%)
- All home page components Flow-compliant
- All dashboard components Flow-compliant
- Studio/Scene navigation Flow-compliant
- Onboarding flows Flow-compliant

---

### Remaining After This Batch

Approximately 55 files will remain for Batches 5-6:
- Notification components (~5 files)
- Layout components (~3 files)
- Marketplace components (~10 files)
- Pricing components (~5 files)
- Community components (~8 files)
- Courses components (~5 files)
- Settings components (~4 files)
- Miscellaneous components (~15 files)
