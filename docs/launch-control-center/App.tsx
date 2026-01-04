import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";

// Auth
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";

// Admin Pages
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminSessions from "./pages/AdminSessions";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSecurity from "./pages/AdminSecurity";
import AdminPayouts from "./pages/AdminPayouts";
import AdminJobs from "./pages/AdminJobs";
import AdminContacts from "./pages/AdminContacts";
import AdminNotifications from "./pages/AdminNotifications";
import AdminBeatFiles from "./pages/AdminBeatFiles";
import AdminPricing from "./pages/AdminPricing";
import AdminPackages from "./pages/AdminPackages";
import AdminRevenue from "./pages/AdminRevenue";
import AdminMarketing from "./pages/AdminMarketing";
import AdminGrowth from "./pages/AdminGrowth";
import AdminUserAnalytics from "./pages/AdminUserAnalytics";
import AdminContentModeration from "./pages/AdminContentModeration";
import AdminSystemMonitoring from "./pages/AdminSystemMonitoring";
import AdminLaunchReadiness from "./pages/AdminLaunchReadiness";
import AdminLaunchControl from "./pages/AdminLaunchControl";
import AdminLaunchDashboard from "./pages/AdminLaunchDashboard";
import AdminLaunchPresentation from "./pages/AdminLaunchPresentation";
import AdminCommandCenter from "./pages/AdminCommandCenter";
import AdminControl from "./pages/AdminControl";
import AdminIntegrations from "./pages/AdminIntegrations";
import AdminFinancial from "./pages/AdminFinancial";
import AdminStripeSync from "./pages/AdminStripeSync";
import AdminTestPayments from "./pages/AdminTestPayments";
import AdminMarketplace from "./pages/AdminMarketplace";
import AdminAchievements from "./pages/AdminAchievements";
import AdminMilestones from "./pages/AdminMilestones";
import AdminEducation from "./pages/AdminEducation";
import AdminFeatures from "./pages/AdminFeatures";
import AdminContent from "./pages/AdminContent";
import AdminMedia from "./pages/AdminMedia";
import AdminAudio from "./pages/AdminAudio";
import AdminPartnerProgram from "./pages/AdminPartnerProgram";
import AdminSecurityCenter from "./pages/AdminSecurityCenter";
import AdminLegalDocuments from "./pages/AdminLegalDocuments";
import AdminSystemPresentation from "./pages/AdminSystemPresentation";

// New Admin Pages
import AdminAssetGallery from "./pages/AdminAssetGallery";
import AdminCommunications from "./pages/AdminCommunications";
import AdminPromoCapture from "./pages/AdminPromoCapture";
import AdminReports from "./pages/AdminReports";
import AdminSecurityDashboard from "./pages/AdminSecurityDashboard";

// Additional Admin Pages
import AuditLog from "./pages/AuditLog";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import AdvancedFeatures from "./pages/AdvancedFeatures";
import AuditCompliance from "./pages/AuditCompliance";
import AutomationHub from "./pages/AutomationHub";
import BackupRecovery from "./pages/BackupRecovery";
import CommunicationCenter from "./pages/CommunicationCenter";
import ContentManagement from "./pages/ContentManagement";
import CoreFeaturesTesting from "./pages/CoreFeaturesTesting";
import CustomerSuccess from "./pages/CustomerSuccess";
import DatabaseManagement from "./pages/DatabaseManagement";
import DataReporting from "./pages/DataReporting";
import IntegrationAutomation from "./pages/IntegrationAutomation";
import LaunchReadiness from "./pages/LaunchReadiness";

import NotFound from "./pages/NotFound";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Default redirect to admin dashboard */}
            <Route path="/" element={<Navigate to="/admin" replace />} />
            
            {/* Core Admin Dashboard */}
            <Route path="/admin" element={<Admin />} />
            
            {/* User & Session Management */}
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
            
            {/* Analytics & Monitoring */}
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/user-analytics" element={<AdminUserAnalytics />} />
            <Route path="/admin/system-monitoring" element={<AdminSystemMonitoring />} />
            <Route path="/admin/advanced-analytics" element={<AdvancedAnalytics />} />
            
            {/* Security */}
            <Route path="/admin/security" element={<AdminSecurity />} />
            <Route path="/admin/security-center" element={<AdminSecurityCenter />} />
            <Route path="/admin/security-dashboard" element={<AdminSecurityDashboard />} />
            <Route path="/admin/audit-log" element={<AuditLog />} />
            <Route path="/admin/audit-compliance" element={<AuditCompliance />} />
            
            {/* Financial */}
            <Route path="/admin/payouts" element={<AdminPayouts />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/packages" element={<AdminPackages />} />
            <Route path="/admin/revenue" element={<AdminRevenue />} />
            <Route path="/admin/financial" element={<AdminFinancial />} />
            <Route path="/admin/stripe-sync" element={<AdminStripeSync />} />
            <Route path="/admin/test-payments" element={<AdminTestPayments />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            
            {/* Content & Media */}
            <Route path="/admin/beat-files" element={<AdminBeatFiles />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/content-moderation" element={<AdminContentModeration />} />
            <Route path="/admin/content-management" element={<ContentManagement />} />
            <Route path="/admin/media" element={<AdminMedia />} />
            <Route path="/admin/audio" element={<AdminAudio />} />
            <Route path="/admin/asset-gallery" element={<AdminAssetGallery />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            
            {/* Communications */}
            <Route path="/admin/communications" element={<AdminCommunications />} />
            <Route path="/admin/communication-center" element={<CommunicationCenter />} />
            <Route path="/admin/promo-capture" element={<AdminPromoCapture />} />
            
            {/* Growth & Marketing */}
            <Route path="/admin/marketing" element={<AdminMarketing />} />
            <Route path="/admin/growth" element={<AdminGrowth />} />
            <Route path="/admin/marketplace" element={<AdminMarketplace />} />
            <Route path="/admin/partner-program" element={<AdminPartnerProgram />} />
            <Route path="/admin/customer-success" element={<CustomerSuccess />} />
            
            {/* Platform Features */}
            <Route path="/admin/achievements" element={<AdminAchievements />} />
            <Route path="/admin/milestones" element={<AdminMilestones />} />
            <Route path="/admin/education" element={<AdminEducation />} />
            <Route path="/admin/features" element={<AdminFeatures />} />
            <Route path="/admin/advanced-features" element={<AdvancedFeatures />} />
            <Route path="/admin/integrations" element={<AdminIntegrations />} />
            <Route path="/admin/integration-automation" element={<IntegrationAutomation />} />
            
            {/* Automation */}
            <Route path="/admin/automation-hub" element={<AutomationHub />} />
            
            {/* Database & Data */}
            <Route path="/admin/database-management" element={<DatabaseManagement />} />
            <Route path="/admin/data-reporting" element={<DataReporting />} />
            <Route path="/admin/backup-recovery" element={<BackupRecovery />} />
            
            {/* Testing */}
            <Route path="/admin/core-features-testing" element={<CoreFeaturesTesting />} />
            
            {/* Launch Control */}
            <Route path="/admin/launch-readiness" element={<AdminLaunchReadiness />} />
            <Route path="/admin/launch-readiness-check" element={<LaunchReadiness />} />
            <Route path="/admin/launch-control" element={<AdminLaunchControl />} />
            <Route path="/admin/launch-dashboard" element={<AdminLaunchDashboard />} />
            <Route path="/admin/launch-presentation" element={<AdminLaunchPresentation />} />
            <Route path="/admin/command-center" element={<AdminCommandCenter />} />
            <Route path="/admin/control" element={<AdminControl />} />
            
            {/* System */}
            <Route path="/admin/legal-documents" element={<AdminLegalDocuments />} />
            <Route path="/admin/system-presentation" element={<AdminSystemPresentation />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
