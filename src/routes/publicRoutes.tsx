import React from "react";
import { Route, Navigate } from "react-router-dom";

// Lazy-loaded QuickStart
const QuickStart = React.lazy(() => import("@/pages/QuickStart"));
const EconomyPublic = React.lazy(() => import("@/pages/EconomyPublic"));

// Lazy-loaded showcase/service pages for public access
const Services = React.lazy(() => import("@/pages/Services"));
const MixingShowcase = React.lazy(() => import("@/pages/MixingShowcase"));
const MasteringShowcase = React.lazy(() => import("@/pages/MasteringShowcase"));
const AIMastering = React.lazy(() => import("@/pages/AIMastering"));
const DistributionHub = React.lazy(() => import("@/pages/DistributionHub"));
const Showcase = React.lazy(() => import("@/pages/Showcase"));
const BeatMarketplace = React.lazy(() => import("@/pages/BeatMarketplace"));

// Public/Marketing pages - static imports for critical routes
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import DemoLogin from "@/pages/DemoLogin";
import InsiderDemo from "@/pages/InsiderDemo";
import Install from "@/pages/Install";
import HowItWorks from "@/pages/HowItWorks";
import FAQ from "@/pages/FAQ";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import Waitlist from "@/pages/Waitlist";
import Press from "@/pages/Press";
import ForArtists from "@/pages/ForArtists";
import ForEngineers from "@/pages/ForEngineers";
import ForProducers from "@/pages/ForProducers";
import ForFans from "@/pages/ForFans";
import Premieres from "@/pages/Premieres";
import Community from "@/pages/Community";
import LivePage from "@/pages/LivePage";
import Achievements from "@/pages/Achievements";
import PrimeBeatForge from "@/pages/PrimeBeatForge";
import PublicProfile from "@/pages/PublicProfile";
import MixClubHome from "@/pages/MixClubHome";
import PromoFunnel from "@/pages/PromoFunnel";
const ForCreatives = React.lazy(() => import("@/pages/ForCreatives"));
import { ROUTES } from "@/config/routes";

export const publicRoutes = (
  <>
    {/* Marketing / Public Routes */}
    <Route path="/" element={<MixClubHome />} />
    <Route path={ROUTES.PROMO_FUNNEL} element={<PromoFunnel />} />
    <Route path={ROUTES.AUTH} element={<Auth />} />
    <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
    <Route path="/demo-login" element={<DemoLogin />} />
    <Route path="/insider-demo" element={<InsiderDemo />} />
    <Route path="/start" element={<React.Suspense fallback={<div className="min-h-screen bg-background" />}><QuickStart /></React.Suspense>} />
    <Route path="/install" element={<Install />} />
    
    <Route path="/home" element={<HowItWorks />} />
    <Route path={ROUTES.HOW_IT_WORKS} element={<Navigate to="/home" replace />} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/about" element={<About />} />
    <Route path="/waitlist" element={<Waitlist />} />
    <Route path="/press" element={<Press />} />
    <Route path="/for-artists" element={<ForArtists />} />
    <Route path="/for-engineers" element={<ForEngineers />} />
    <Route path="/for-producers" element={<ForProducers />} />
    <Route path="/for-fans" element={<ForFans />} />
    <Route path={ROUTES.FOR_CREATIVES} element={<React.Suspense fallback={<div className="min-h-screen bg-background" />}><ForCreatives /></React.Suspense>} />
    
    {/* Studio & Services — Public showcase (unauthenticated access) */}
    <Route path={ROUTES.SERVICES} element={<React.Suspense fallback={<div className="min-h-screen bg-background" />}><Services /></React.Suspense>} />
    <Route path={ROUTES.SERVICES_MIXING} element={<React.Suspense fallback={<div className="min-h-screen bg-background" />}><MixingShowcase /></React.Suspense>} />
    <Route path={ROUTES.SERVICES_MASTERING} element={<React.Suspense fallback={<div className="min-h-screen bg-background" />}><MasteringShowcase /></React.Suspense>} />
    <Route path={ROUTES.SERVICES_AI_MASTERING} element={<React.Suspense fallback={<div className="min-h-screen bg-background" />}><AIMastering /></React.Suspense>} />
    <Route path={ROUTES.SERVICES_DISTRIBUTION} element={<React.Suspense fallback={<div className="min-h-screen bg-background" />}><DistributionHub /></React.Suspense>} />
    <Route path={ROUTES.SHOWCASE} element={<React.Suspense fallback={<div className="min-h-screen bg-background" />}><Showcase /></React.Suspense>} />
    
    {/* Marketplace — Public showcase */}
    <Route path={ROUTES.MARKETPLACE} element={<React.Suspense fallback={<div className="min-h-screen bg-background" />}><BeatMarketplace /></React.Suspense>} />
    <Route path={ROUTES.BEATS} element={<React.Suspense fallback={<div className="min-h-screen bg-background" />}><BeatMarketplace /></React.Suspense>} />

    {/* Mixxclub platform routes - public */}
    <Route path="/premieres" element={<Premieres />} />
    <Route path="/community" element={<Community />} />
    <Route path="/live" element={<LivePage />} />
    <Route path="/achievements" element={<Achievements />} />
    <Route path="/beat-forge" element={<PrimeBeatForge />} />
    <Route path={ROUTES.ECONOMY} element={<React.Suspense fallback={<div className="min-h-screen bg-background" />}><EconomyPublic /></React.Suspense>} />
    <Route path="/u/:username" element={<PublicProfile />} />
  </>
);