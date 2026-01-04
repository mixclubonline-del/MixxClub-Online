import React from "react";
import { Routes, Route } from "react-router-dom";

// All admin pages - lazy loaded within the bundle
const Admin = React.lazy(() => import("@/pages/Admin"));
const AdminUsers = React.lazy(() => import("@/pages/AdminUsers"));
const AdminAudio = React.lazy(() => import("@/pages/AdminAudio"));
const AdminMedia = React.lazy(() => import("@/pages/AdminMedia"));
const AdminPayouts = React.lazy(() => import("@/pages/AdminPayouts"));
const AdminPackages = React.lazy(() => import("@/pages/AdminPackages"));
const AdminFeatures = React.lazy(() => import("@/pages/AdminFeatures"));
const AdminEducation = React.lazy(() => import("@/pages/AdminEducation"));
const AdminMarketplace = React.lazy(() => import("@/pages/AdminMarketplace"));
const AdminIntegrations = React.lazy(() => import("@/pages/AdminIntegrations"));
const AdminMilestones = React.lazy(() => import("@/pages/AdminMilestones"));
const AdminFinancial = React.lazy(() => import("@/pages/AdminFinancial"));
const AdminAnalytics = React.lazy(() => import("@/pages/AdminAnalytics"));
const AdminContent = React.lazy(() => import("@/pages/AdminContent"));
const AdminTestPayments = React.lazy(() => import("@/pages/AdminTestPayments"));
const AdminStripeSync = React.lazy(() => import("@/pages/AdminStripeSync"));
const AdminBeatFiles = React.lazy(() => import("@/pages/AdminBeatFiles"));
const AdminContacts = React.lazy(() => import("@/pages/AdminContacts"));
const AdminJobs = React.lazy(() => import("@/pages/AdminJobs"));
const AdminNotifications = React.lazy(() => import("@/pages/AdminNotifications"));
const AdminSessions = React.lazy(() => import("@/pages/AdminSessions"));
const AdminSecurity = React.lazy(() => import("@/pages/AdminSecurity"));
const AdminAchievements = React.lazy(() => import("@/pages/AdminAchievements"));
const AdminLegalDocuments = React.lazy(() => import("@/pages/AdminLegalDocuments"));
const AdminSystemPresentation = React.lazy(() => import("@/pages/AdminSystemPresentation"));
const AdminLaunchPresentation = React.lazy(() => import("@/pages/AdminLaunchPresentation"));
const AdminLaunchDashboard = React.lazy(() => import("@/pages/AdminLaunchDashboard"));
const AdminLaunchReadiness = React.lazy(() => import("@/pages/AdminLaunchReadiness"));
const AdminAssetGallery = React.lazy(() => import("@/pages/AdminAssetGallery"));
const AdminPromoCapture = React.lazy(() => import("@/pages/AdminPromoCapture"));
const AdminRevenue = React.lazy(() => import("@/pages/AdminRevenue"));
const AdminUserAnalytics = React.lazy(() => import("@/pages/AdminUserAnalytics"));
const AdminContentModeration = React.lazy(() => import("@/pages/AdminContentModeration"));
const AdminSystemMonitoring = React.lazy(() => import("@/pages/AdminSystemMonitoring"));
const AdminMarketing = React.lazy(() => import("@/pages/AdminMarketing"));
const AdminGrowth = React.lazy(() => import("@/pages/AdminGrowth"));
const AdminCommunications = React.lazy(() => import("@/pages/AdminCommunications"));
const AdminReports = React.lazy(() => import("@/pages/AdminReports"));
const AdminSecurityDashboard = React.lazy(() => import("@/pages/AdminSecurityDashboard"));
const AdminControl = React.lazy(() => import("@/pages/AdminControl"));
const AdminSecurityCenter = React.lazy(() => import("@/pages/AdminSecurityCenter"));
const AdminLaunchControl = React.lazy(() => import("@/pages/AdminLaunchControl"));
const AdminCommandCenter = React.lazy(() => import("@/pages/AdminCommandCenter"));

// Additional admin pages
const MobileTesting = React.lazy(() => import("@/pages/MobileTesting"));
const CoreFeaturesTesting = React.lazy(() => import("@/pages/CoreFeaturesTesting"));
const RevenueFeatures = React.lazy(() => import("@/pages/RevenueFeatures"));
const UXOptimization = React.lazy(() => import("@/pages/UXOptimization"));
const MarketingGrowth = React.lazy(() => import("@/pages/MarketingGrowth"));
const CustomerSuccess = React.lazy(() => import("@/pages/CustomerSuccess"));
const DataReporting = React.lazy(() => import("@/pages/DataReporting"));
const IntegrationAutomation = React.lazy(() => import("@/pages/IntegrationAutomation"));
const TeamManagement = React.lazy(() => import("@/pages/TeamManagement"));
const LaunchReadiness = React.lazy(() => import("@/pages/LaunchReadiness"));
const CommunicationCenter = React.lazy(() => import("@/pages/CommunicationCenter"));
const AdvancedAnalytics = React.lazy(() => import("@/pages/AdvancedAnalytics"));
const ContentManagement = React.lazy(() => import("@/pages/ContentManagement"));
const PlatformConfiguration = React.lazy(() => import("@/pages/PlatformConfiguration"));
const UserManagement = React.lazy(() => import("@/pages/UserManagement"));
const SystemMonitoring = React.lazy(() => import("@/pages/SystemMonitoring"));
const AuditLog = React.lazy(() => import("@/pages/AuditLog"));
const AdvancedFeatures = React.lazy(() => import("@/pages/AdvancedFeatures"));
const RealtimeDashboard = React.lazy(() => import("@/pages/RealtimeDashboard"));
const DatabaseManagement = React.lazy(() => import("@/pages/DatabaseManagement"));
const AuditCompliance = React.lazy(() => import("@/pages/AuditCompliance"));
const BackupRecovery = React.lazy(() => import("@/pages/BackupRecovery"));
const AutomationHub = React.lazy(() => import("@/pages/AutomationHub"));
const MultiTenancy = React.lazy(() => import("@/pages/MultiTenancy"));
const MobileAdminBot = React.lazy(() => import("@/pages/MobileAdminBot"));
const PresentationShare = React.lazy(() => import("@/pages/PresentationShare"));

// Admin Bundle - all admin routes in one component
const AdminBundle = () => {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <Routes>
        <Route path="/" element={<Admin />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/beat-files" element={<AdminBeatFiles />} />
        <Route path="/contacts" element={<AdminContacts />} />
        <Route path="/jobs" element={<AdminJobs />} />
        <Route path="/notifications" element={<AdminNotifications />} />
        <Route path="/sessions" element={<AdminSessions />} />
        <Route path="/security" element={<AdminSecurity />} />
        <Route path="/achievements" element={<AdminAchievements />} />
        <Route path="/packages" element={<AdminPackages />} />
        <Route path="/features" element={<AdminFeatures />} />
        <Route path="/education" element={<AdminEducation />} />
        <Route path="/marketplace" element={<AdminMarketplace />} />
        <Route path="/integrations" element={<AdminIntegrations />} />
        <Route path="/milestones" element={<AdminMilestones />} />
        <Route path="/financial" element={<AdminFinancial />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
        <Route path="/content" element={<AdminContent />} />
        <Route path="/audio" element={<AdminAudio />} />
        <Route path="/media" element={<AdminMedia />} />
        <Route path="/payouts" element={<AdminPayouts />} />
        <Route path="/test-payments" element={<AdminTestPayments />} />
        <Route path="/stripe-sync" element={<AdminStripeSync />} />
        <Route path="/legal-documents" element={<AdminLegalDocuments />} />
        <Route path="/system-presentation" element={<AdminSystemPresentation />} />
        <Route path="/revenue-management" element={<AdminRevenue />} />
        <Route path="/user-analytics" element={<AdminUserAnalytics />} />
        <Route path="/content-moderation" element={<AdminContentModeration />} />
        <Route path="/system-monitoring" element={<AdminSystemMonitoring />} />
        <Route path="/marketing-tools" element={<AdminMarketing />} />
        <Route path="/growth-analytics" element={<AdminGrowth />} />
        <Route path="/launch-presentation" element={<AdminLaunchPresentation />} />
        <Route path="/launch-dashboard" element={<AdminLaunchDashboard />} />
        <Route path="/launch-readiness" element={<AdminLaunchReadiness />} />
        <Route path="/communications" element={<AdminCommunications />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/security-dashboard" element={<AdminSecurityDashboard />} />
        <Route path="/asset-gallery" element={<AdminAssetGallery />} />
        <Route path="/promo-capture" element={<AdminPromoCapture />} />
        <Route path="/mobile-testing" element={<MobileTesting />} />
        <Route path="/core-testing" element={<CoreFeaturesTesting />} />
        <Route path="/revenue" element={<RevenueFeatures />} />
        <Route path="/ux-optimization" element={<UXOptimization />} />
        <Route path="/marketing" element={<MarketingGrowth />} />
        <Route path="/customer-success" element={<CustomerSuccess />} />
        <Route path="/data-reporting" element={<DataReporting />} />
        <Route path="/integration-automation" element={<IntegrationAutomation />} />
        <Route path="/team-management" element={<TeamManagement />} />
        <Route path="/command-center" element={<AdminCommandCenter />} />
        <Route path="/control" element={<AdminControl />} />
        <Route path="/monitoring" element={<SystemMonitoring />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/advanced-features" element={<AdvancedFeatures />} />
        <Route path="/realtime-dashboard" element={<RealtimeDashboard />} />
        <Route path="/database" element={<DatabaseManagement />} />
        <Route path="/audit-compliance" element={<AuditCompliance />} />
        <Route path="/backup-recovery" element={<BackupRecovery />} />
        <Route path="/automation" element={<AutomationHub />} />
        <Route path="/multi-tenancy" element={<MultiTenancy />} />
        <Route path="/launch-control" element={<AdminLaunchControl />} />
        <Route path="/configuration" element={<PlatformConfiguration />} />
        <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
        <Route path="/content-management" element={<ContentManagement />} />
      </Routes>
    </React.Suspense>
  );
};

export default AdminBundle;
