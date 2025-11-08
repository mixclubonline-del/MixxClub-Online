import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PWAInstallPrompt } from "@/components/mobile/PWAInstallPrompt";
import { MobileRouteGuard } from "@/components/mobile/MobileRouteGuard";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { usePageTracking } from "@/hooks/useAnalytics";
import { PrimeProvider } from "@/contexts/PrimeContext";
import PrimeConsole from "@/components/prime/PrimeConsole";
import PrimeStatusBar from "@/components/prime/PrimeStatusBar";
import { useMobileDetect } from "@/hooks/useMobileDetect";
import { SplashScreen } from "@/components/SplashScreen";
import { useSplashScreen } from "@/hooks/useSplashScreen";

// Lazy load heavy components
const MixClubHome = React.lazy(() => import("./pages/MixClubHome"));
const Home = React.lazy(() => import("./pages/Home"));

// Keep IntroScene non-lazy since it's the landing page
import IntroScene from "./pages/IntroScene";
const ArtistCRM = React.lazy(() => import("./pages/ArtistCRM"));
const EngineerCRM = React.lazy(() => import("./pages/EngineerCRM"));
const AudioLab = React.lazy(() => import("./pages/AudioLab"));
const Admin = React.lazy(() => import("./pages/Admin"));
const AIMastering = React.lazy(() => import("./pages/AIMastering"));
const HybridDAW = React.lazy(() => import("./pages/HybridDAW"));
const CollaborativeWorkspace = React.lazy(() => import("./pages/CollaborativeWorkspace"));
const Premieres = React.lazy(() => import("./pages/Premieres"));

// Keep critical routes non-lazy
import MixBattles from "./pages/MixBattles";
import CommunityLeaderboard from "./pages/CommunityLeaderboard";
import HowItWorks from "./pages/HowItWorks";
import Network from "./pages/Network";
import Artist from "./pages/Artist";
import Engineer from "./pages/Engineer";
import Community from "./pages/Community";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ArtistOnboarding from "./pages/ArtistOnboarding";
import EngineerOnboarding from "./pages/EngineerOnboarding";
import HybridOnboarding from "./pages/HybridOnboarding";
import Dashboard from "./pages/Dashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import EngineerDashboard from "./pages/EngineerDashboard";

import SessionWorkspace from "./pages/SessionWorkspace";
import { SessionWorkspacePage } from "./pages/SessionWorkspacePage";
import Mixing from "./pages/Mixing";
import Mastering from "./pages/Mastering";
import MixingShowcase from "./pages/MixingShowcase";
import MasteringShowcase from "./pages/MasteringShowcase";
import Services from "./pages/Services";

import BattleTournaments from "./pages/BattleTournaments";

import MyCertifications from "./pages/MyCertifications";
import Marketplace from "./pages/Marketplace";
import LabelServices from "./pages/LabelServices";
import Integrations from "./pages/Integrations";
import AIAudioIntelligence from "./pages/AIAudioIntelligence";
import DistributionHub from "./pages/DistributionHub";
import ForEngineers from "./pages/ForEngineers";
import EngineerDirectory from "./pages/EngineerDirectory";
import EngineerProfile from "./pages/EngineerProfile";
import ComingSoon from "./pages/ComingSoon";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Settings from "./pages/Settings";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import About from "./pages/About";
import ForArtists from "./pages/ForArtists";

// Enterprise System - System #11
const Enterprise = React.lazy(() => import("./pages/Enterprise"));
const EnterpriseDemo = React.lazy(() => import("./pages/EnterpriseDemo"));

// Lazy load all admin pages for better performance
const AdminUsers = React.lazy(() => import("./pages/AdminUsers"));
const AdminAudio = React.lazy(() => import('./pages/AdminAudio'));
const AdminMedia = React.lazy(() => import('./pages/AdminMedia'));
const AdminPayouts = React.lazy(() => import('./pages/AdminPayouts'));
const AdminPackages = React.lazy(() => import('./pages/AdminPackages'));
const AdminFeatures = React.lazy(() => import('./pages/AdminFeatures'));
const AdminEducation = React.lazy(() => import("./pages/AdminEducation"));
const AdminMarketplace = React.lazy(() => import("./pages/AdminMarketplace"));
const AdminIntegrations = React.lazy(() => import("./pages/AdminIntegrations"));
const AdminMilestones = React.lazy(() => import("./pages/AdminMilestones"));
const AdminFinancial = React.lazy(() => import('./pages/AdminFinancial'));
const AdminAnalytics = React.lazy(() => import('./pages/AdminAnalytics'));
const AdminContent = React.lazy(() => import('./pages/AdminContent'));
const AdminTestPayments = React.lazy(() => import('./pages/AdminTestPayments'));
const AdminStripeSync = React.lazy(() => import('./pages/AdminStripeSync'));
const AdminBeatFiles = React.lazy(() => import('./pages/AdminBeatFiles'));
const AdminContacts = React.lazy(() => import('./pages/AdminContacts'));
const AdminJobs = React.lazy(() => import('./pages/AdminJobs'));
const AdminNotifications = React.lazy(() => import('./pages/AdminNotifications'));
const AdminSessions = React.lazy(() => import('./pages/AdminSessions'));
const AdminSecurity = React.lazy(() => import('./pages/AdminSecurity'));
const AdminAchievements = React.lazy(() => import('./pages/AdminAchievements'));
const AdminLegalDocuments = React.lazy(() => import('./pages/AdminLegalDocuments'));
const AdminSystemPresentation = React.lazy(() => import('./pages/AdminSystemPresentation'));
const AdminLaunchPresentation = React.lazy(() => import('./pages/AdminLaunchPresentation'));
const AdminLaunchDashboard = React.lazy(() => import('./pages/AdminLaunchDashboard'));
const AdminLaunchReadiness = React.lazy(() => import('./pages/AdminLaunchReadiness'));
const MobileAdminBot = React.lazy(() => import('./pages/MobileAdminBot'));
const MobileTesting = React.lazy(() => import("./pages/MobileTesting"));
const CoreFeaturesTesting = React.lazy(() => import("./pages/CoreFeaturesTesting"));
const RevenueFeatures = React.lazy(() => import("./pages/RevenueFeatures"));
const UXOptimization = React.lazy(() => import("./pages/UXOptimization"));
const MarketingGrowth = React.lazy(() => import("./pages/MarketingGrowth"));
const CustomerSuccess = React.lazy(() => import("./pages/CustomerSuccess"));
const DataReporting = React.lazy(() => import("./pages/DataReporting"));
const IntegrationAutomation = React.lazy(() => import("./pages/IntegrationAutomation"));
const TeamManagement = React.lazy(() => import("./pages/TeamManagement"));
const AdminCommandCenter = React.lazy(() => import("./pages/AdminCommandCenter"));
const LaunchReadiness = React.lazy(() => import("./pages/LaunchReadiness"));
const CommunicationCenter = React.lazy(() => import("./pages/CommunicationCenter"));
const AdvancedAnalytics = React.lazy(() => import("./pages/AdvancedAnalytics"));
const ContentManagement = React.lazy(() => import("./pages/ContentManagement"));
const AdminControl = React.lazy(() => import("./pages/AdminControl"));
const PlatformConfiguration = React.lazy(() => import("./pages/PlatformConfiguration"));
const UserManagement = React.lazy(() => import("./pages/UserManagement"));
const SystemMonitoring = React.lazy(() => import("./pages/SystemMonitoring"));
const AuditLog = React.lazy(() => import("./pages/AuditLog"));
const AdvancedFeatures = React.lazy(() => import("./pages/AdvancedFeatures"));
const RealtimeDashboard = React.lazy(() => import("./pages/RealtimeDashboard"));
const DatabaseManagement = React.lazy(() => import("./pages/DatabaseManagement"));
const Search = React.lazy(() => import("./pages/Search"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const AuditCompliance = React.lazy(() => import("./pages/AuditCompliance"));
const BackupRecovery = React.lazy(() => import("./pages/BackupRecovery"));
const AutomationHub = React.lazy(() => import("./pages/AutomationHub"));
const MultiTenancy = React.lazy(() => import("./pages/MultiTenancy"));
const AdminSecurityCenter = React.lazy(() => import('./pages/AdminSecurityCenter'));
const AdminLaunchControl = React.lazy(() => import('./pages/AdminLaunchControl'));
const PresentationShare = React.lazy(() => import('./pages/PresentationShare'));
import { JobBoard } from './pages/JobBoard';
import ProjectDetail from "./pages/ProjectDetail";
import MerchStore from "./pages/MerchStore";
import ArtistStorefront from "./pages/ArtistStorefront";
import ArtistMerchManager from "./pages/ArtistMerchManager";
import MessagingTest from "./pages/MessagingTest";
import NotFound from "./pages/NotFound";
import MobileHome from "./pages/MobileHome";
import MobileLanding from "./pages/MobileLanding";
import MobileAdmin from "./pages/MobileAdmin";
import MobileAdminPayouts from "./pages/MobileAdminPayouts";
import MobileAdminUsers from "./pages/MobileAdminUsers";
import MobileMixxBot from "./pages/MobileMixxBot";
import { PersistentChatbot } from "@/components/PersistentChatbot";
import { AppLayout } from "@/components/layouts/AppLayout";
import { PageTransition } from "@/components/layouts/PageTransition";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { CookieConsent } from "@/components/legal/CookieConsent";

// Desktop-only components wrapper
const DesktopOnlyComponents = () => {
  const { deviceType } = useMobileDetect();

  // Only render on desktop
  if (deviceType !== 'desktop') {
    return null;
  }

  return (
    <>
      <PersistentChatbot />
      <PrimeConsole />
      <PrimeStatusBar />
    </>
  );
};

// App content wrapper for analytics tracking
const AppContent = () => {
  usePageTracking();
  return (
    <PageTransition>
      <MobileRouteGuard />
      <OfflineIndicator />
      <React.Suspense fallback={<DashboardSkeleton />}>
        <Routes>
          <Route path="/" element={<MixClubHome />} />
          <Route path="/mixclub" element={<MixClubHome />} />
          <Route path="/install" element={<Install />} />
          <Route path="/network" element={<Navigate to="/" replace />} />
          <Route path="/artist" element={<Artist />} />
          <Route path="/engineer" element={<Engineer />} />
          
          <Route path="/premieres" element={<Premieres />} />
          {/* Unified Community Hub */}
          <Route path="/community" element={<Community />} />

          {/* Legacy redirects to Community Hub */}
          <Route path="/pulse" element={<Navigate to="/community?tab=feed" replace />} />
          <Route path="/arena" element={<Navigate to="/community?tab=arena" replace />} />
          <Route path="/crowd" element={<Navigate to="/community?tab=crowd" replace />} />
          <Route path="/feed" element={<Navigate to="/community?tab=feed" replace />} />
          <Route path="/mix-battles" element={<Navigate to="/community?tab=arena" replace />} />
          <Route path="/leaderboard" element={<CommunityLeaderboard />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding/artist" element={<ArtistOnboarding />} />
          <Route path="/onboarding/engineer" element={<EngineerOnboarding />} />
          <Route path="/onboarding/hybrid" element={<HybridOnboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/artist-dashboard" element={<Navigate to="/artist-crm" replace />} />
          <Route path="/engineer-dashboard" element={<Navigate to="/engineer-crm" replace />} />
          <Route path="/artist-crm" element={<AppLayout><ArtistCRM /></AppLayout>} />
          <Route path="/engineer-crm" element={<AppLayout><EngineerCRM /></AppLayout>} />
          <Route path="/hybrid-daw" element={<HybridDAW />} />
          <Route path="/session/:sessionId" element={<AppLayout><SessionWorkspacePage /></AppLayout>} />
          <Route path="/collaborate/:sessionId" element={<CollaborativeWorkspace />} />
          {/* Services Hub */}
          <Route path="/services" element={<Services />} />
          <Route path="/services/mixing" element={<MixingShowcase />} />
          <Route path="/services/mastering" element={<MasteringShowcase />} />
          <Route path="/services/ai-mastering" element={<AIMastering />} />
          <Route path="/services/distribution" element={<DistributionHub />} />

          {/* Enterprise Solutions - System #11 */}
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/enterprise-demo" element={<AdminRoute section="Enterprise Demo"><EnterpriseDemo /></AdminRoute>} />

          {/* Legacy service redirects */}
          <Route path="/mixing" element={<Navigate to="/services/mixing" replace />} />
          <Route path="/mastering" element={<Navigate to="/services/mastering" replace />} />
          <Route path="/ai-mastering" element={<Navigate to="/services/ai-mastering" replace />} />
          <Route path="/distribution" element={<Navigate to="/services/distribution" replace />} />
          <Route path="/jobs" element={<AppLayout><JobBoard /></AppLayout>} />
          <Route path="/messaging-test" element={<MessagingTest />} />
          <Route path="/admin" element={<AdminRoute section="Admin Dashboard"><Admin /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute section="Users"><AdminUsers /></AdminRoute>} />
          <Route path="/admin/beat-files" element={<AdminRoute section="Beat Files"><AdminBeatFiles /></AdminRoute>} />
          <Route path="/admin/contacts" element={<AdminRoute section="Contacts"><AdminContacts /></AdminRoute>} />
          <Route path="/admin/jobs" element={<AdminRoute section="Jobs"><AdminJobs /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute section="Notifications"><AdminNotifications /></AdminRoute>} />
          <Route path="/admin/sessions" element={<AdminRoute section="Sessions"><AdminSessions /></AdminRoute>} />
          <Route path="/admin/security" element={<AdminRoute section="Security"><AdminSecurity /></AdminRoute>} />
          <Route path="/admin/achievements" element={<AdminRoute section="Achievements"><AdminAchievements /></AdminRoute>} />
          <Route path="/admin/packages" element={<AdminRoute section="Packages"><AdminPackages /></AdminRoute>} />
          <Route path="/admin/features" element={<AdminRoute section="Features"><AdminFeatures /></AdminRoute>} />
          <Route path="/admin/education" element={<AdminRoute section="Education"><AdminEducation /></AdminRoute>} />
          <Route path="/admin/marketplace" element={<AdminRoute section="Marketplace"><AdminMarketplace /></AdminRoute>} />
          <Route path="/admin/integrations" element={<AdminRoute section="Integrations"><AdminIntegrations /></AdminRoute>} />
          <Route path="/admin/milestones" element={<AdminRoute section="Milestones"><AdminMilestones /></AdminRoute>} />
          <Route path="/admin/financial" element={<AdminRoute section="Financial"><AdminFinancial /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute section="Analytics"><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/content" element={<AdminRoute section="Content"><AdminContent /></AdminRoute>} />
          <Route path="/admin/audio" element={<AdminRoute section="Audio"><AdminAudio /></AdminRoute>} />
          <Route path="/admin/media" element={<AdminRoute section="Media"><AdminMedia /></AdminRoute>} />
          <Route path="/admin/payouts" element={<AdminRoute section="Payouts"><AdminPayouts /></AdminRoute>} />
          <Route path="/admin/test-payments" element={<AdminRoute section="Test Payments"><AdminTestPayments /></AdminRoute>} />
          <Route path="/admin/stripe-sync" element={<AdminRoute section="Stripe Sync"><AdminStripeSync /></AdminRoute>} />
          <Route path="/admin/legal-documents" element={<AdminRoute section="Legal Documents"><AdminLegalDocuments /></AdminRoute>} />
          <Route path="/admin/system-presentation" element={<AdminRoute section="System Presentation"><AdminSystemPresentation /></AdminRoute>} />
          <Route path="/admin/launch-presentation" element={<AdminRoute section="Launch Presentation"><AdminLaunchPresentation /></AdminRoute>} />
          <Route path="/admin/launch-dashboard" element={<AdminRoute section="Launch Dashboard"><AdminLaunchDashboard /></AdminRoute>} />
          <Route path="/admin/launch-readiness" element={<AdminRoute section="Launch Readiness"><AdminLaunchReadiness /></AdminRoute>} />
          <Route path="/presentation/share/:token" element={<PresentationShare />} />
          <Route path="/for-artists" element={<ForArtists />} />
          <Route path="/for-engineers" element={<ForEngineers />} />
          <Route path="/engineers" element={<EngineerDirectory />} />
          <Route path="/engineer/:userId" element={<EngineerProfile />} />
          <Route path="/audio-lab" element={<AudioLab />} />
          
          <Route path="/project/:projectId" element={<AppLayout><ProjectDetail /></AppLayout>} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:paymentId" element={<OrderSuccess />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />

          {/* Mobile Routes */}
          <Route path="/mobile-home" element={<MobileHome />} />
          <Route path="/mobile-landing" element={<MobileLanding />} />
          <Route path="/mobile-admin" element={<MobileAdmin />} />
          <Route path="/mobile-mixxbot" element={<MobileMixxBot />} />
          <Route path="/mobile-admin/payouts" element={<MobileAdminPayouts />} />
          <Route path="/mobile-admin/users" element={<MobileAdminUsers />} />
          <Route path="/admin-launch-readiness" element={<AdminLaunchReadiness />} />
          <Route path="/mobile-admin-bot" element={<MobileAdminBot />} />
          <Route path="/admin-security" element={<AdminSecurityCenter />} />
          <Route path="/admin/launch-control" element={<AdminLaunchControl />} />
          <Route path="/admin/mobile-testing" element={<MobileTesting />} />
          <Route path="/admin/core-testing" element={<CoreFeaturesTesting />} />
          <Route path="/admin/revenue" element={<RevenueFeatures />} />
          <Route path="/admin/ux-optimization" element={<UXOptimization />} />
          <Route path="/admin/marketing" element={<MarketingGrowth />} />
          <Route path="/admin/customer-success" element={<CustomerSuccess />} />
          <Route path="/admin/data-reporting" element={<DataReporting />} />
          <Route path="/admin/integration-automation" element={<IntegrationAutomation />} />
          <Route path="/admin/team-management" element={<TeamManagement />} />
          <Route path="/admin/command-center" element={<AdminCommandCenter />} />
          <Route path="/admin/launch-readiness" element={<LaunchReadiness />} />
          <Route path="/admin/communications" element={<CommunicationCenter />} />
          <Route path="/admin/advanced-analytics" element={<AdvancedAnalytics />} />
          <Route path="/admin/content-management" element={<ContentManagement />} />
          <Route path="/admin/configuration" element={<PlatformConfiguration />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/control" element={<AdminRoute section="Control Panel"><AdminControl /></AdminRoute>} />
          <Route path="/admin/monitoring" element={<SystemMonitoring />} />
          <Route path="/admin/audit-log" element={<AuditLog />} />
          <Route path="/admin/advanced-features" element={<AdvancedFeatures />} />
          <Route path="/admin/realtime-dashboard" element={<RealtimeDashboard />} />
          <Route path="/admin/database" element={<DatabaseManagement />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin/audit-compliance" element={<AuditCompliance />} />
          <Route path="/admin/backup-recovery" element={<BackupRecovery />} />
          <Route path="/admin/automation" element={<AutomationHub />} />
          <Route path="/admin/multi-tenancy" element={<MultiTenancy />} />

          {/* Tier 1 Features */}
          <Route path="/battle-tournaments" element={<BattleTournaments />} />
          

          {/* Tier 2 Features */}
          <Route path="/my-certifications" element={<MyCertifications />} />

          {/* Tier 3 Features */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/label-services" element={<LabelServices />} />

          {/* Tier 4 Features */}
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/ai-audio-intelligence" element={<AIAudioIntelligence />} />
          <Route path="/distribution" element={<AppLayout><DistributionHub /></AppLayout>} />

          {/* Merch Store */}
          <Route path="/merch" element={<AppLayout><MerchStore /></AppLayout>} />
          <Route path="/merch/:username" element={<AppLayout><ArtistStorefront /></AppLayout>} />
          <Route path="/artist/merch-manager" element={<AppLayout><ArtistMerchManager /></AppLayout>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
      <PWAInstallPrompt />
    </PageTransition>
  );
};

const App = () => {
  const { showSplash, handleSplashComplete } = useSplashScreen();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && (
            <SplashScreen
              onComplete={handleSplashComplete}
              duration={2500}
            />
          )}
          <BrowserRouter>
            <AuthProvider>
              <PrimeProvider>
                <PWAInstallPrompt />
                <AppContent />
                <DesktopOnlyComponents />
                <PerformanceMonitor />
                <CookieConsent />
              </PrimeProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
