import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
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
import AdminFinancial from './pages/AdminFinancial';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminContent from './pages/AdminContent';
import { JobBoard } from './pages/JobBoard';
import HybridDAW from "./pages/HybridDAW";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
import MobileHome from "./pages/MobileHome";
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
            <Route path="/admin/packages" element={<AdminPackages />} />
            <Route path="/admin/features" element={<AdminFeatures />} />
            <Route path="/admin/financial" element={<AdminFinancial />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/audio" element={<AdminAudio />} />
            <Route path="/admin/media" element={<AdminMedia />} />
            <Route path="/admin/payouts" element={<AdminPayouts />} />
            <Route path="/for-engineers" element={<ForEngineers />} />
            <Route path="/engineers" element={<EngineerDirectory />} />
            <Route path="/engineer/:userId" element={<EngineerProfile />} />
            <Route path="/project/:projectId" element={<ProjectDetail />} />
            <Route path="/mobile-home" element={<MobileHome />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PersistentChatbot />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
