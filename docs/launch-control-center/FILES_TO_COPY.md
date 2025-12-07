# MixClub Launch Control Center - Files to Copy

## Overview
Total files to copy: ~168 files

---

## 1. Admin Pages (41 files)
Copy from `src/pages/` to new project's `src/pages/`:

```
Admin.tsx
AdminAchievements.tsx
AdminAnalytics.tsx
AdminAudio.tsx
AdminBeatFiles.tsx
AdminCommandCenter.tsx
AdminContacts.tsx
AdminContent.tsx
AdminContentModeration.tsx
AdminControl.tsx
AdminEducation.tsx
AdminFeatures.tsx
AdminFinancial.tsx
AdminGrowth.tsx
AdminIntegrations.tsx
AdminJobs.tsx
AdminLaunchControl.tsx
AdminLaunchDashboard.tsx
AdminLaunchPresentation.tsx
AdminLaunchReadiness.tsx
AdminLegalDocuments.tsx
AdminMarketing.tsx
AdminMarketplace.tsx
AdminMedia.tsx
AdminMilestones.tsx
AdminNotifications.tsx
AdminPackages.tsx
AdminPartnerProgram.tsx
AdminPayouts.tsx
AdminPricing.tsx
AdminRevenue.tsx
AdminSecurity.tsx
AdminSecurityCenter.tsx
AdminSessions.tsx
AdminStripeSync.tsx
AdminStub.tsx
AdminSystemMonitoring.tsx
AdminSystemPresentation.tsx
AdminTestPayments.tsx
AdminUserAnalytics.tsx
AdminUsers.tsx
```

---

## 2. Admin Components (110 files)
Copy entire folder: `src/components/admin/` → `src/components/admin/`

---

## 3. Shared UI Components
Copy entire folder: `src/components/ui/` → `src/components/ui/`

---

## 4. Required Hooks (copy from `src/hooks/`)
```
useAuth.tsx
useIsMobile.tsx
useMobileDetect.tsx
useToast.ts
use-toast.ts
```

---

## 5. Required Integrations
Copy entire folder: `src/integrations/supabase/` → `src/integrations/supabase/`
- client.ts (modify with shared Supabase credentials)
- types.ts

---

## 6. Required Lib Files
```
src/lib/utils.ts
src/lib/queryClient.ts
```

---

## 7. Styles
```
src/index.css
tailwind.config.ts
```

---

## 8. Additional Support Pages
```
src/pages/Auth.tsx
src/pages/AuthCallback.tsx
src/pages/NotFound.tsx
src/pages/AuditLog.tsx
```

---

## Files to CREATE (not copy)
- `src/App.tsx` (new simplified version)
- `src/main.tsx` (standard React entry)
- `package.json` (trimmed dependencies)
- `vite.config.ts` (standard config)
