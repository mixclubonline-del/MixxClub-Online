import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PWAInstallPrompt } from "@/components/mobile/PWAInstallPrompt";
import { MobileRouteGuard } from "@/components/mobile/MobileRouteGuard";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load heavy components
const Home = React.lazy(() => import("./pages/Home"));
const ArtistCRM = React.lazy(() => import("./pages/ArtistCRM"));
const EngineerCRM = React.lazy(() => import("./pages/EngineerCRM"));
const AudioLab = React.lazy(() => import("./pages/AudioLab"));
const HybridDAW = React.lazy(() => import("./pages/HybridDAW"));
const Admin = React.lazy(() => import("./pages/Admin"));

// Keep critical routes non-lazy
import MixBattles from "./pages/MixBattles";
import CommunityLeaderboard from "./pages/CommunityLeaderboard";
import HowItWorks from "./pages/HowItWorks";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ArtistOnboarding from "./pages/ArtistOnboarding";
import EngineerOnboarding from "./pages/EngineerOnboarding";
import HybridOnboarding from "./pages/HybridOnboarding";
import Dashboard from "./pages/Dashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import EngineerDashboard from "./pages/EngineerDashboard";
import ArtistStudio from "./pages/ArtistStudio";
import EngineerStudio from "./pages/EngineerStudio";
import Mixing from "./pages/Mixing";
import Mastering from "./pages/Mastering";
import MixingShowcase from "./pages/MixingShowcase";
import MasteringShowcase from "./pages/MasteringShowcase";
import BattleTournaments from "./pages/BattleTournaments";
import StudioDirectory from "./pages/StudioDirectory";
import EducationalHub from "./pages/EducationalHub";
import CourseViewer from "./pages/CourseViewer";
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
import AdminUsers from "./pages/AdminUsers";
import AdminAudio from './pages/AdminAudio';
import AdminMedia from './pages/AdminMedia';
import AdminPayouts from './pages/AdminPayouts';
import AdminPackages from './pages/AdminPackages';
import AdminFeatures from './pages/AdminFeatures';
import AdminEducation from "./pages/AdminEducation";
import AdminMarketplace from "./pages/AdminMarketplace";
import AdminIntegrations from "./pages/AdminIntegrations";
import AdminMilestones from "./pages/AdminMilestones";
import AdminFinancial from './pages/AdminFinancial';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminContent from './pages/AdminContent';
import AdminTestPayments from './pages/AdminTestPayments';
import AdminBeatFiles from './pages/AdminBeatFiles';
import AdminContacts from './pages/AdminContacts';
import AdminJobs from './pages/AdminJobs';
import AdminNotifications from './pages/AdminNotifications';
import AdminSessions from './pages/AdminSessions';
import AdminSecurity from './pages/AdminSecurity';
import AdminAchievements from './pages/AdminAchievements';
import AdminLegalDocuments from './pages/AdminLegalDocuments';
import AdminSystemPresentation from './pages/AdminSystemPresentation';
import AdminLaunchPresentation from './pages/AdminLaunchPresentation';
import AdminLaunchDashboard from './pages/AdminLaunchDashboard';
import AdminLaunchReadiness from './pages/AdminLaunchReadiness';
import MobileAdminBot from './pages/MobileAdminBot';
import MobileTesting from "@/pages/MobileTesting";
import CoreFeaturesTesting from "@/pages/CoreFeaturesTesting";
import RevenueFeatures from "@/pages/RevenueFeatures";
import UXOptimization from "@/pages/UXOptimization";
import AdminSecurityCenter from './pages/AdminSecurityCenter';
import AdminLaunchControl from './pages/AdminLaunchControl';
import PresentationShare from './pages/PresentationShare';
import { JobBoard } from './pages/JobBoard';
import ProjectDetail from "./pages/ProjectDetail";
import MerchStore from "./pages/MerchStore";
import NotFound from "./pages/NotFound";
import MobileHome from "./pages/MobileHome";
import MobileLanding from "./pages/MobileLanding";
import MobileAdmin from "./pages/MobileAdmin";
import MobileAdminPayouts from "./pages/MobileAdminPayouts";
import MobileAdminUsers from "./pages/MobileAdminUsers";
import MobileMixxBot from "./pages/MobileMixxBot";
import { PersistentChatbot } from "@/components/PersistentChatbot";
import { AppLayout } from "@/components/layouts/AppLayout";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <MobileRouteGuard />
            <OfflineIndicator />
            <React.Suspense fallback={<DashboardSkeleton />}>
              <Routes>
                <Route path="/" element={<Home />} />
            <Route path="/mix-battles" element={<MixBattles />} />
            <Route path="/leaderboard" element={<CommunityLeaderboard />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding/artist" element={<ArtistOnboarding />} />
        <Route path="/onboarding/engineer" element={<EngineerOnboarding />} />
        <Route path="/onboarding/hybrid" element={<HybridOnboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/artist-dashboard" element={<ArtistDashboard />} />
            <Route path="/engineer-dashboard" element={<EngineerDashboard />} />
        <Route path="/artist-crm" element={<AppLayout><ArtistCRM /></AppLayout>} />
        <Route path="/engineer-crm" element={<AppLayout><EngineerCRM /></AppLayout>} />
        <Route path="/artist-studio" element={<AppLayout><ArtistStudio /></AppLayout>} />
        <Route path="/engineer-studio" element={<AppLayout><EngineerStudio /></AppLayout>} />
            <Route path="/mixing" element={<MixingShowcase />} />
            <Route path="/mastering" element={<MasteringShowcase />} />
            <Route path="/mixing-studio" element={<Mixing />} />
            <Route path="/mastering-studio" element={<Mastering />} />
            <Route path="/hybrid-daw" element={<AppLayout><HybridDAW /></AppLayout>} />
            <Route path="/jobs" element={<AppLayout><JobBoard /></AppLayout>} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/beat-files" element={<AdminBeatFiles />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/security" element={<AdminSecurity />} />
            <Route path="/admin/achievements" element={<AdminAchievements />} />
            <Route path="/admin/packages" element={<AdminPackages />} />
            <Route path="/admin/features" element={<AdminFeatures />} />
            <Route path="/admin/education" element={<AdminEducation />} />
            <Route path="/admin/marketplace" element={<AdminMarketplace />} />
            <Route path="/admin/integrations" element={<AdminIntegrations />} />
            <Route path="/admin/milestones" element={<AdminMilestones />} />
            <Route path="/admin/financial" element={<AdminFinancial />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/audio" element={<AdminAudio />} />
            <Route path="/admin/media" element={<AdminMedia />} />
            <Route path="/admin/payouts" element={<AdminPayouts />} />
            <Route path="/admin/test-payments" element={<AdminTestPayments />} />
            <Route path="/admin/legal-documents" element={<AdminLegalDocuments />} />
            <Route path="/admin/system-presentation" element={<AdminSystemPresentation />} />
            <Route path="/admin/launch-presentation" element={<AdminLaunchPresentation />} />
            <Route path="/admin/launch-dashboard" element={<AdminLaunchDashboard />} />
            <Route path="/admin/launch-readiness" element={<AdminLaunchReadiness />} />
            <Route path="/presentation/share/:token" element={<PresentationShare />} />
            <Route path="/for-engineers" element={<ForEngineers />} />
            <Route path="/engineers" element={<EngineerDirectory />} />
            <Route path="/engineer/:userId" element={<EngineerProfile />} />
            <Route path="/audio-lab" element={<AudioLab />} />
            <Route path="/project/:projectId" element={<AppLayout><ProjectDetail /></AppLayout>} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            
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
            
            {/* Tier 1 Features */}
            <Route path="/battle-tournaments" element={<BattleTournaments />} />
            <Route path="/studio-directory" element={<StudioDirectory />} />
            
            {/* Tier 2 Features */}
            <Route path="/education" element={<EducationalHub />} />
            <Route path="/course/:courseId" element={<CourseViewer />} />
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
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </React.Suspense>
          <PersistentChatbot />
          <PWAInstallPrompt />
          <PerformanceMonitor />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
