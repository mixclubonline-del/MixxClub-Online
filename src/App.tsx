import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PWAInstallPrompt } from "@/components/mobile/PWAInstallPrompt";
import Home from "./pages/Home";
import MixBattles from "./pages/MixBattles";
import CommunityLeaderboard from "./pages/CommunityLeaderboard";
import HowItWorks from "./pages/HowItWorks";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ArtistOnboarding from "./pages/ArtistOnboarding";
import EngineerOnboarding from "./pages/EngineerOnboarding";
import Dashboard from "./pages/Dashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import EngineerDashboard from "./pages/EngineerDashboard";
import ArtistCRM from "./pages/ArtistCRM";
import EngineerCRM from "./pages/EngineerCRM";
import ArtistStudio from "./pages/ArtistStudio";
import EngineerStudio from "./pages/EngineerStudio";
import Mixing from "./pages/Mixing";
import Mastering from "./pages/Mastering";
import MixingShowcase from "./pages/MixingShowcase";
import MasteringShowcase from "./pages/MasteringShowcase";
import BattleTournaments from "./pages/BattleTournaments";
import StudioDirectory from "./pages/StudioDirectory";
import EducationHub from "./pages/EducationHub";
import ForEngineers from "./pages/ForEngineers";
import EngineerDirectory from "./pages/EngineerDirectory";
import EngineerProfile from "./pages/EngineerProfile";
import Admin from "./pages/Admin";
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
import { JobBoard } from './pages/JobBoard';
import HybridDAW from "./pages/HybridDAW";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import MobileHome from "./pages/MobileHome";
import MobileLanding from "./pages/MobileLanding";
import MobileAdmin from "./pages/MobileAdmin";
import MobileAdminPayouts from "./pages/MobileAdminPayouts";
import MobileAdminUsers from "./pages/MobileAdminUsers";
import MobileMixxBot from "./pages/MobileMixxBot";
import { PersistentChatbot } from "@/components/PersistentChatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mix-battles" element={<MixBattles />} />
            <Route path="/leaderboard" element={<CommunityLeaderboard />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding/artist" element={<ArtistOnboarding />} />
        <Route path="/onboarding/engineer" element={<EngineerOnboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/artist-dashboard" element={<ArtistDashboard />} />
            <Route path="/engineer-dashboard" element={<EngineerDashboard />} />
        <Route path="/artist-crm" element={<ArtistCRM />} />
        <Route path="/engineer-crm" element={<EngineerCRM />} />
        <Route path="/artist-studio" element={<ArtistStudio />} />
        <Route path="/engineer-studio" element={<EngineerStudio />} />
            <Route path="/mixing" element={<MixingShowcase />} />
            <Route path="/mastering" element={<MasteringShowcase />} />
            <Route path="/mixing-studio" element={<Mixing />} />
            <Route path="/mastering-studio" element={<Mastering />} />
            <Route path="/hybrid-daw" element={<HybridDAW />} />
            <Route path="/jobs" element={<JobBoard />} />
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
            <Route path="/for-engineers" element={<ForEngineers />} />
            <Route path="/engineers" element={<EngineerDirectory />} />
            <Route path="/engineer/:userId" element={<EngineerProfile />} />
            <Route path="/project/:projectId" element={<ProjectDetail />} />
            
            {/* Mobile Routes */}
          <Route path="/mobile-home" element={<MobileHome />} />
          <Route path="/mobile-landing" element={<MobileLanding />} />
            <Route path="/mobile-admin" element={<MobileAdmin />} />
            <Route path="/mobile-mixxbot" element={<MobileMixxBot />} />
            <Route path="/mobile-admin/payouts" element={<MobileAdminPayouts />} />
            <Route path="/mobile-admin/users" element={<MobileAdminUsers />} />
            
            {/* Tier 1 Features */}
            <Route path="/battle-tournaments" element={<BattleTournaments />} />
            <Route path="/studio-directory" element={<StudioDirectory />} />
            
            {/* Tier 2 Features */}
            <Route path="/education-hub" element={<EducationHub />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PersistentChatbot />
          <PWAInstallPrompt />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
