import React from "react";
import { Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Core app pages - static imports for frequently used routes
import Dashboard from "@/pages/Dashboard";
import Community from "@/pages/Community";
import Crowd from "@/pages/Crowd";
import CommunityLeaderboard from "@/pages/CommunityLeaderboard";
import Services from "@/pages/Services";
import SessionsBrowser from "@/pages/SessionsBrowser";
import CreateSession from "@/pages/CreateSession";
import SessionDetail from "@/pages/SessionDetail";
import Achievements from "@/pages/Achievements";
import UnlockablesHub from "@/pages/UnlockablesHub";
import Settings from "@/pages/Settings";
import NotificationPreferences from "@/pages/NotificationPreferences";
import AudioUpload from "@/pages/AudioUpload";
import EngineerDirectory from "@/pages/EngineerDirectory";
import EngineerProfile from "@/pages/EngineerProfile";
import ComingSoon from "@/pages/ComingSoon";
import DistributionHub from "@/pages/DistributionHub";
import OrderSuccess from "@/pages/OrderSuccess";
import Checkout from "@/pages/Checkout";
import PaymentCanceled from "@/pages/PaymentCanceled";
import PaymentSuccess from "@/pages/PaymentSuccess";
import MyCertifications from "@/pages/MyCertifications";
import Tutorials from "@/pages/Tutorials";
import MessagingTest from "@/pages/MessagingTest";
import ProjectDetail from "@/pages/ProjectDetail";

// Onboarding pages
import ArtistOnboarding from "@/pages/ArtistOnboarding";
import EngineerOnboarding from "@/pages/EngineerOnboarding";
import HybridOnboarding from "@/pages/HybridOnboarding";

// Service showcase pages
import MixingShowcase from "@/pages/MixingShowcase";
import MasteringShowcase from "@/pages/MasteringShowcase";

// Lazy loaded app pages
const ArtistCRM = React.lazy(() => import("@/pages/ArtistCRM"));
const EngineerCRM = React.lazy(() => import("@/pages/EngineerCRM"));
const AudioLab = React.lazy(() => import("@/pages/AudioLab"));
const AIMastering = React.lazy(() => import("@/pages/AIMastering"));
const HybridDAW = React.lazy(() => import("@/pages/HybridDAW"));
const CollaborativeWorkspace = React.lazy(() => import("@/pages/CollaborativeWorkspace"));
const Premieres = React.lazy(() => import("@/pages/Premieres"));
const Marketplace = React.lazy(() => import("@/pages/Marketplace"));
const LabelServices = React.lazy(() => import("@/pages/LabelServices"));
const Integrations = React.lazy(() => import("@/pages/Integrations"));
const AIAudioIntelligence = React.lazy(() => import("@/pages/AIAudioIntelligence"));
const Search = React.lazy(() => import("@/pages/Search"));
const Notifications = React.lazy(() => import("@/pages/Notifications"));
const SunoTest = React.lazy(() => import("@/pages/SunoTest"));
const BrandForge = React.lazy(() => import("@/pages/BrandForge"));
const PrimeBeatForge = React.lazy(() => import("@/pages/PrimeBeatForge"));
const PrimeMarketingCopy = React.lazy(() => import("@/pages/PrimeMarketingCopy"));
const MarketingCommandCenter = React.lazy(() => import("@/pages/MarketingCommandCenter"));
const MerchStore = React.lazy(() => import("@/pages/MerchStore"));
const ArtistStorefront = React.lazy(() => import("@/pages/ArtistStorefront"));
const ArtistMerchManager = React.lazy(() => import("@/pages/ArtistMerchManager"));
const EnterpriseDemo = React.lazy(() => import("@/pages/EnterpriseDemo"));
const DreamEngine = React.lazy(() => import("@/pages/DreamEngine"));
const FreemiumOverview = React.lazy(() => import("@/pages/FreemiumOverview"));
const MatchingDashboard = React.lazy(() => import("@/pages/MatchingDashboard"));
const Sitemap = React.lazy(() => import("@/pages/Sitemap"));
const PartnerProgram = React.lazy(() => import("@/pages/PartnerProgram"));
const Economy = React.lazy(() => import("@/pages/Economy"));
 const ProducerCRM = React.lazy(() => import("@/pages/ProducerCRM"));
 const FanHub = React.lazy(() => import("@/pages/FanHub"));

// Live Streaming pages
const LivePage = React.lazy(() => import("@/pages/LivePage"));
const WatchStreamPage = React.lazy(() => import("@/pages/WatchStreamPage"));
const BroadcastPage = React.lazy(() => import("@/pages/BroadcastPage"));

// Public Profile
const PublicProfile = React.lazy(() => import("@/pages/PublicProfile"));

// Job Board
import { JobBoard } from "@/pages/JobBoard";

export const appRoutes = (
  <>
    {/* Dashboard & CRM */}
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/artist-dashboard" element={<Navigate to="/artist-crm" replace />} />
    <Route path="/engineer-dashboard" element={<Navigate to="/engineer-crm" replace />} />
    <Route path="/artist-crm" element={<AppLayout><ArtistCRM /></AppLayout>} />
    <Route path="/engineer-crm" element={<AppLayout><EngineerCRM /></AppLayout>} />
     <Route path="/producer-crm" element={<AppLayout><ProducerCRM /></AppLayout>} />
     <Route path="/fan-hub" element={<AppLayout><FanHub /></AppLayout>} />

    {/* Sessions & Collaboration */}
    <Route path="/sessions" element={<SessionsBrowser />} />
    <Route path="/create-session" element={<CreateSession />} />
    <Route path="/session/:sessionId" element={<SessionDetail />} />
    <Route path="/collaborate/:sessionId" element={<CollaborativeWorkspace />} />
    <Route path="/hybrid-daw" element={<HybridDAW />} />

    {/* Community */}
    <Route path="/community" element={<Community />} />
    <Route path="/crowd" element={<Crowd />} />
    <Route path="/premieres" element={<Premieres />} />
    <Route path="/leaderboard" element={<CommunityLeaderboard />} />
    <Route path="/achievements" element={<Achievements />} />
    <Route path="/unlockables" element={<UnlockablesHub />} />
    <Route path="/economy" element={<Economy />} />
    
    {/* Live Streaming */}
    <Route path="/live" element={<AppLayout><LivePage /></AppLayout>} />
    <Route path="/watch/:streamId" element={<AppLayout><WatchStreamPage /></AppLayout>} />
    <Route path="/broadcast/:streamId" element={<BroadcastPage />} />
    
    {/* Legacy redirects */}
    <Route path="/pulse" element={<Navigate to="/community?tab=feed" replace />} />
    <Route path="/arena" element={<Navigate to="/community?tab=arena" replace />} />
    <Route path="/feed" element={<Navigate to="/community?tab=feed" replace />} />
    <Route path="/mix-battles" element={<Navigate to="/community?tab=arena" replace />} />

    {/* Services */}
    <Route path="/services" element={<Services />} />
    <Route path="/services/mixing" element={<MixingShowcase />} />
    <Route path="/services/mastering" element={<MasteringShowcase />} />
    <Route path="/services/ai-mastering" element={<AIMastering />} />
    <Route path="/services/distribution" element={<DistributionHub />} />
    
    {/* Legacy service redirects */}
    <Route path="/mixing" element={<Navigate to="/services/mixing" replace />} />
    <Route path="/mastering" element={<Navigate to="/services/mastering" replace />} />
    <Route path="/ai-mastering" element={<Navigate to="/services/ai-mastering" replace />} />
    <Route path="/distribution" element={<Navigate to="/services/distribution" replace />} />

    {/* Engineers */}
    <Route path="/engineers" element={<EngineerDirectory />} />
    <Route path="/engineer/:userId" element={<EngineerProfile />} />

    {/* Tools & Features */}
    <Route path="/upload" element={<AudioUpload />} />
    <Route path="/audio-lab" element={<AudioLab />} />
    <Route path="/suno-test" element={<SunoTest />} />
    <Route path="/brand-forge" element={<BrandForge />} />
    <Route path="/prime-beat-forge" element={<PrimeBeatForge />} />
    <Route path="/prime-marketing" element={<PrimeMarketingCopy />} />
    <Route path="/marketing-command-center" element={<AppLayout><MarketingCommandCenter /></AppLayout>} />
    <Route path="/jobs" element={<AppLayout><JobBoard /></AppLayout>} />
    <Route path="/messaging-test" element={<MessagingTest />} />

    {/* Onboarding */}
    <Route path="/onboarding/artist" element={<ProtectedRoute><ArtistOnboarding /></ProtectedRoute>} />
    <Route path="/onboarding/engineer" element={<ProtectedRoute><EngineerOnboarding /></ProtectedRoute>} />
    <Route path="/onboarding/hybrid" element={<ProtectedRoute><HybridOnboarding /></ProtectedRoute>} />

    {/* Projects & Orders */}
    <Route path="/project/:projectId" element={<AppLayout><ProjectDetail /></AppLayout>} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/payment-success" element={<PaymentSuccess />} />
    <Route path="/order-success/:paymentId" element={<OrderSuccess />} />
    <Route path="/payment-canceled" element={<PaymentCanceled />} />

    {/* Settings */}
    <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
    <Route path="/notification-preferences" element={<NotificationPreferences />} />
    <Route path="/search" element={<Search />} />
    <Route path="/notifications" element={<Notifications />} />

    {/* Features by tier */}
    <Route path="/battle-tournaments" element={<ComingSoon />} />
    <Route path="/my-certifications" element={<MyCertifications />} />
    <Route path="/tutorials" element={<Tutorials />} />
    <Route path="/marketplace" element={<Marketplace />} />
    <Route path="/label-services" element={<LabelServices />} />
    <Route path="/integrations" element={<Integrations />} />
    <Route path="/ai-audio-intelligence" element={<AIAudioIntelligence />} />
    <Route path="/distribution" element={<DistributionHub />} />
    <Route path="/coming-soon" element={<ComingSoon />} />

    {/* Merch Store */}
    <Route path="/merch" element={<AppLayout><MerchStore /></AppLayout>} />
    <Route path="/merch/:username" element={<AppLayout><ArtistStorefront /></AppLayout>} />
    <Route path="/store/:username" element={<AppLayout><ArtistStorefront /></AppLayout>} />
    <Route path="/artist/merch-manager" element={<AppLayout><ArtistMerchManager /></AppLayout>} />

    {/* Enterprise */}
    <Route path="/enterprise-demo" element={<EnterpriseDemo />} />

    {/* Dream Engine (Vision Control) */}
    <Route path="/dream-engine" element={<DreamEngine />} />
    <Route path="/landing-forge" element={<Navigate to="/dream-engine" replace />} />

    {/* Utility Pages */}
    <Route path="/freemium" element={<FreemiumOverview />} />
    <Route path="/matching" element={<MatchingDashboard />} />
    <Route path="/partner-program" element={<AppLayout><PartnerProgram /></AppLayout>} />
    <Route path="/sitemap" element={<Sitemap />} />

    {/* Public Profiles */}
    <Route path="/u/:username" element={<AppLayout><PublicProfile /></AppLayout>} />
  </>
);
