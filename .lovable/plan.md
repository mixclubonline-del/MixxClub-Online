

# Fabric Flow Spine Migration - Phase 2
## Completing the `useNavigate` to `setIntent` Migration

### Executive Summary

**Scope:** Migrate remaining ~105 files from direct `useNavigate()` usage to the Fabric Flow Intent system  
**Current Progress:** 20/126 files migrated (~16%)  
**Remaining:** ~105 files across pages, components, and hooks  

---

### Migration Strategy

The migration will proceed in **batches by file category**, ensuring each batch is testable before proceeding:

```text
┌─────────────────────────────────────────────────────────────────────┐
│  Batch 1: Core Pages (15 files)                                     │
│  → BroadcastPage, Checkout, SessionDetail, Enterprise, Privacy...  │
├─────────────────────────────────────────────────────────────────────┤
│  Batch 2: CRM Components (20 files)                                 │
│  → CRMLayout, CompletedProjectCard, CRMPortal, DistributionWorkflow│
├─────────────────────────────────────────────────────────────────────┤
│  Batch 3: Mobile System (12 files)                                  │
│  → MobileEnhancedNav, MobileRouteGuard, MobileMixxBot...           │
├─────────────────────────────────────────────────────────────────────┤
│  Batch 4: Immersive/City Components (10 files)                      │
│  → CityMapOverlay, CityDistrictCard, TheTower...                   │
├─────────────────────────────────────────────────────────────────────┤
│  Batch 5: Hooks (8 files)                                           │
│  → useStartConversation, usePartnershipEarnings...                 │
├─────────────────────────────────────────────────────────────────────┤
│  Batch 6: Remaining Components (40 files)                           │
│  → Courses, Community, Live, Pricing, Settings, Onboarding...      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Technical Details

#### Pattern Replacement Reference

| Before (Direct Navigate) | After (Flow Intent) |
|--------------------------|---------------------|
| `navigate('/auth')` | `goToAuth('login')` |
| `navigate('/auth?mode=signup')` | `goToAuth('signup')` |
| `navigate('/artist-crm')` | `openArtistCRM()` |
| `navigate('/artist-crm?tab=messages')` | `openArtistCRM('messages')` |
| `navigate('/engineer-crm?tab=business')` | `openEngineerCRM('business')` |
| `navigate('/project/${id}')` | `viewProject(id)` |
| `navigate('/live')` | `navigateTo('/live')` |
| `navigate('/checkout', { state })` | `navigateTo('/checkout')` + state handling |
| `navigate(-1)` or `navigate('/back')` | `goBack()` |

#### Files Requiring Special Handling

1. **State-passing navigations** (e.g., `Enterprise.tsx` line 134):
   ```typescript
   // Before
   navigate('/auth', { state: { returnTo: '/enterprise' } });
   
   // After - use Flow's redirectAfter pattern
   goToAuth('login', '/enterprise');
   ```

2. **Redirect-after-action patterns** (e.g., `Checkout.tsx` line 132):
   ```typescript
   // Before
   navigate(`/auth?mode=signin&redirect=${encodeURIComponent(...)}`);
   
   // After
   goToAuth('login', window.location.pathname + window.location.search);
   ```

3. **Hooks returning navigation functions** (e.g., `useStartConversation.ts`):
   - Import `useFlowNavigation` inside the hook
   - Replace `navigate()` calls with semantic methods

---

### Batch 1: Core Pages (15 files)

| File | Navigate Calls | Intent Mapping |
|------|---------------|----------------|
| `src/pages/BroadcastPage.tsx` | 2 | `navigateTo('/live')` |
| `src/pages/Checkout.tsx` | 2 | `goToAuth()`, `navigateTo()` |
| `src/pages/SessionDetail.tsx` | 4 | `navigateTo('/sessions')`, `goToAuth()` |
| `src/pages/Enterprise.tsx` | 4 | `goToAuth()`, `navigateTo('/checkout')` |
| `src/pages/Privacy.tsx` | 1 | `goBack()` |
| `src/pages/MobileMixxBot.tsx` | 1 | `goToAuth()` |
| `src/pages/Showcase.tsx` | 1 | `navigateTo()` |
| `src/pages/WatchStreamPage.tsx` | 2 | `navigateTo('/live')` |
| `src/pages/AudioUpload.tsx` | 2 | auth + project routes |
| `src/pages/HybridOnboarding.tsx` | 1 | `openArtistCRM()` |
| `src/pages/SessionWorkspace.tsx` | 1 | `navigateTo()` |

---

### Batch 2: CRM Components (20 files)

| File | Navigate Calls | Intent Mapping |
|------|---------------|----------------|
| `src/components/crm/CRMLayout.tsx` | 2 | `navigateTo()` for paths |
| `src/components/crm/CompletedProjectCard.tsx` | 1 | `viewProject(id)` |
| `src/components/crm/CRMPortal.tsx` | multiple | tab navigation |
| `src/components/crm/DistributionWorkflow.tsx` | 1 | `navigateTo()` |
| `src/components/crm/ProjectCard.tsx` | 1 | `viewProject(id)` |
| `src/components/crm/HireRequestCard.tsx` | 2 | `openArtistCRM()` |
| `src/components/crm/RecentActivityFeed.tsx` | 2 | various routes |

---

### Batch 3: Mobile System (12 files)

| File | Navigate Calls | Intent Mapping |
|------|---------------|----------------|
| `src/components/mobile/MobileEnhancedNav.tsx` | 6 | `navigateTo()` for all paths |
| `src/components/mobile/MobileRouteGuard.tsx` | 1 | conditional redirect |
| `src/components/mobile/MobileBottomNav.tsx` | 4 | `navigateTo()` |
| `src/components/mobile/MobileAuthDialog.tsx` | 1 | `goToAuth()` |

---

### Batch 4: Immersive/City Components (10 files)

| File | Navigate Calls | Intent Mapping |
|------|---------------|----------------|
| `src/components/immersive/CityMapOverlay.tsx` | 1 | `navigateTo()` with callback |
| `src/components/immersive/CityDistrictCard.tsx` | 1 | `goToDistrict()` |
| `src/pages/city/TheTower.tsx` | 2 | city navigation |

---

### Batch 5: Hooks (8 files)

| File | Navigate Calls | Intent Mapping |
|------|---------------|----------------|
| `src/hooks/useStartConversation.ts` | 1 | `openArtistCRM('messages')` |
| `src/hooks/useCoursePlayer.ts` | 1 | course routes |
| `src/hooks/useAudioUpload.ts` | 1 | project routes |

---

### Batch 6: Remaining Components (40 files)

Includes:
- `src/components/courses/CoursesPage.tsx`
- `src/components/community/*`
- `src/components/live/*`
- `src/components/pricing/*`
- `src/components/settings/*`
- `src/components/onboarding/*`
- `src/components/landing/*`
- `src/components/marketplace/*`

---

### ESLint Enforcement

After migration, upgrade the ESLint rule from `warn` to `error`:

```javascript
// eslint.config.js
rules: {
  "mixxclub/no-direct-navigate": "error", // Was "warn"
}
```

This will:
- Block any new `useNavigate` imports outside `src/core/fabric/`
- Fail CI builds on violations
- Provide clear error messages pointing to `FABRIC_BOUNDARY.md`

---

### Verification Steps

1. **Build verification** after each batch
2. **Manual smoke test** of critical flows:
   - Auth → CRM navigation
   - Project creation → detail view
   - Mobile bottom nav functionality
   - City map overlay navigation
3. **ESLint check**: `npx eslint src --ext .ts,.tsx | grep "no-direct-navigate"`

---

### Estimated Timeline

| Batch | Files | Complexity |
|-------|-------|------------|
| Batch 1 | 15 | Medium |
| Batch 2 | 20 | Low-Medium |
| Batch 3 | 12 | Medium |
| Batch 4 | 10 | Low |
| Batch 5 | 8 | Medium |
| Batch 6 | 40 | Low |

**Total remaining:** ~105 files

