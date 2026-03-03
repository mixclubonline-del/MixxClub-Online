import React from "react";
import { Route, Navigate } from "react-router-dom";

// Lazy-loaded QuickStart
const QuickStart = React.lazy(() => import("@/pages/QuickStart"));

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
import Premieres from "@/pages/Premieres";
import Community from "@/pages/Community";
import LivePage from "@/pages/LivePage";
import Achievements from "@/pages/Achievements";
import PrimeBeatForge from "@/pages/PrimeBeatForge";
import PublicProfile from "@/pages/PublicProfile";
import MixClubHome from "@/pages/MixClubHome";
import PromoFunnel from "@/pages/PromoFunnel";
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
    
    <Route path={ROUTES.HOW_IT_WORKS} element={<HowItWorks />} />
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
    
    {/* Mixxclub platform routes - authenticated */}
    <Route path="/premieres" element={<Premieres />} />
    <Route path="/community" element={<Community />} />
    <Route path="/live" element={<LivePage />} />
    <Route path="/achievements" element={<Achievements />} />
    <Route path="/beat-forge" element={<PrimeBeatForge />} />
    <Route path="/u/:username" element={<PublicProfile />} />
  </>
);