
# Fabric Flow Spine Migration - Batch 5
## Courses, Notifications, Payment, and Storefront Components

### Overview

**Batch Scope:** Migrate remaining files from direct `useNavigate()` usage to the Fabric Flow Intent system  
**Current Progress:** ~70/126 files migrated (~56%)  
**Files in This Batch:** 20 files across courses, notifications, payments, storefronts, and home components

---

### Files to Migrate in This Batch

#### Priority 1: Courses & Education (2 files)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/components/courses/CoursesPage.tsx` | auth redirect for enrollment | `goToAuth('login', '/courses')` |
| `src/pages/InsiderDemo.tsx` | auth/signup navigation | `goToAuth('signup')` |

#### Priority 2: Notification Components (3 files)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/components/NotificationCenter.tsx` | action_url navigation | `navigateTo(action_url)` |
| `src/components/notifications/NotificationItem.tsx` | action_url navigation | `navigateTo(action_url)` |
| `src/pages/NotificationPreferences.tsx` | back navigation | `goBack()` |

#### Priority 3: Payment & Checkout (1 file)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/components/payment/MultiPaymentModal.tsx` | project redirect after payment | `viewProject(projectId)` |

#### Priority 4: CRM & Business (4 files)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/components/crm/YourMatches.tsx` | CRM & home navigation | `openArtistCRM()`, `navigateTo('/')` |
| `src/components/crm/BrandHub.tsx` | profile navigation | `navigateTo('/u/username')` |
| `src/components/crm/SavedJobsList.tsx` | job board navigation | `navigateTo('/job-board')` |
| `src/components/crm/ServiceRecommendations.tsx` | CRM tab navigation | `openArtistCRM(tab)` |

#### Priority 5: Home & Landing Components (4 files)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/components/home/ValueProposition.tsx` | auth navigation | `goToAuth()` |
| `src/components/home/AIMasteringCTA.tsx` | mastering/pricing pages | `navigateTo('/ai-mastering')` |
| `src/components/InstantDemoSection.tsx` | auth signup redirect | `goToAuth('signup')` |
| `src/pages/FreemiumOverview.tsx` | auth & checkout navigation | `goToAuth('signup')`, `navigateTo('/checkout')` |

#### Priority 6: Pages & Misc (3 files)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/pages/Terms.tsx` | home navigation | `navigateTo('/')` |
| `src/pages/MobileHome.tsx` | auth & route navigation | `goToAuth()`, `navigateTo(...)` |
| `src/pages/ProjectDetail.tsx` | auth & back navigation | `goToAuth()`, `goBack()` |

#### Priority 7: Storefront & Live (3 files)
| File | Navigate Usage | Intent Mapping |
|------|---------------|----------------|
| `src/components/storefront/StorefrontManager.tsx` | store page navigation | `viewStore(slug)` |
| `src/components/live/GoLiveModal.tsx` | broadcast page redirect | `navigateTo('/broadcast/id')` |
| `src/components/city/CityLayout.tsx` | district navigation | `goToDistrict(...)` or `navigateTo(path)` |

---

### Technical Implementation

#### Pattern Replacement Examples

```typescript
// CoursesPage.tsx - Auth redirect with return path
// Before
navigate('/auth?redirect=/courses');

// After
goToAuth('login', '/courses');
```

```typescript
// NotificationCenter.tsx - Dynamic action URL
// Before
if (notification.action_url) {
  navigate(notification.action_url);
}

// After
if (notification.action_url) {
  navigateTo(notification.action_url);
}
```

```typescript
// MultiPaymentModal.tsx - Project redirect after payment
// Before
navigate(`/project/${projectId}`);

// After
viewProject(projectId);
```

```typescript
// YourMatches.tsx - CRM navigation with query params
// Before
navigate(`/artist-crm?tab=projects&action=new&engineer=${match.engineerId}`);

// After
openArtistCRM(`projects&action=new&engineer=${match.engineerId}`);
```

```typescript
// CityLayout.tsx - District navigation
// Before
navigate(district.path);

// After
navigateTo(district.path);
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
const { navigateTo, goToAuth, goBack, openArtistCRM, viewProject, viewStore } = useFlowNavigation();
```

---

### Special Handling Notes

1. **NotificationCenter.tsx**: Uses `useLocation` for route change detection (keep) and `navigate` for action URLs. The `useLocation` import should remain.

2. **MultiPaymentModal.tsx**: Multiple navigate calls for post-payment redirect. All should use `viewProject(projectId)`.

3. **YourMatches.tsx**: Uses navigate in two contexts:
   - `navigate('/')` for finding matches - use `navigateTo('/')`
   - `navigate('/artist-crm?tab=...')` - use `openArtistCRM(...)`

4. **CityLayout.tsx**: Uses both `navigate` and `useLocation`. Keep `useLocation` for pathname checks, replace navigate calls.

5. **InsiderDemo.tsx**: Large file with navigate for signup - replace with `goToAuth('signup')`.

6. **usePrimeBotActions.ts** and **useGlobalKeyboardShortcuts.tsx**: These are hooks - they need to import `useFlowNavigation` internally.

---

### Expected Outcome

After this batch:
- **90/126 files migrated** (~71%)
- All notification components Flow-compliant
- All payment components Flow-compliant
- All course components Flow-compliant
- All storefront components Flow-compliant
- All landing page components Flow-compliant

---

### Remaining After This Batch

Approximately 35 files will remain for Batches 6-7:
- Additional hooks (~5 files)
- Community/social components (~8 files)
- Remaining CRM components (~5 files)
- Settings components (~4 files)
- Miscellaneous UI components (~13 files)
