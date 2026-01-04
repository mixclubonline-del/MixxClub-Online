# MixClub Launch Control Center - Files to Copy

## Overview
Total files to copy: ~185 files

---

## 1. Admin Pages (46 files)
Copy from `src/pages/` to new project's `src/pages/`:

```
Admin.tsx
AdminAchievements.tsx
AdminAnalytics.tsx
AdminAssetGallery.tsx
AdminAudio.tsx
AdminBeatFiles.tsx
AdminCommandCenter.tsx
AdminCommunications.tsx
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
AdminPromoCapture.tsx
AdminReports.tsx
AdminRevenue.tsx
AdminSecurity.tsx
AdminSecurityCenter.tsx
AdminSecurityDashboard.tsx
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

## 2. Admin Components (115+ files)
Copy entire folder: `src/components/admin/` → `src/components/admin/`

Key components include:
- EmailSequenceManager.tsx (email automation)
- N8nWorkflowTemplates.tsx (workflow automation)
- All dashboard, analytics, and management components

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
useAdminAuth.ts
useAdminAlerts.ts
useAdminCalendar.ts
useAdminCalendar.tsx
useAdminSecurityEvents.ts
useUsers.ts
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
src/lib/journey-events.ts
```

Copy entire folder:
```
src/lib/n8n-templates/ → src/lib/n8n-templates/
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
src/pages/AdvancedAnalytics.tsx
src/pages/AdvancedFeatures.tsx
src/pages/AuditCompliance.tsx
src/pages/AutomationHub.tsx
src/pages/BackupRecovery.tsx
src/pages/CommunicationCenter.tsx
src/pages/ContentManagement.tsx
src/pages/CoreFeaturesTesting.tsx
src/pages/CustomerSuccess.tsx
src/pages/DatabaseManagement.tsx
src/pages/DataReporting.tsx
src/pages/IntegrationAutomation.tsx
src/pages/LaunchReadiness.tsx
```

---

## Files to CREATE (not copy)
- `src/App.tsx` (use template from this folder)
- `src/main.tsx` (standard React entry)
- `package.json` (use template from this folder)
- `vite.config.ts` (standard config)

---

## Summary by Category

| Category | File Count |
|----------|------------|
| Admin Pages | 46 |
| Admin Components | 115+ |
| UI Components | ~50 |
| Hooks | 11 |
| Lib Files | 3 + n8n-templates folder |
| Support Pages | 17 |
| **Total** | **~185** |
