import React from "react";
import { Route, Navigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";

// Critical landing page — static import (above the fold)
import MixClubHome from "@/pages/MixClubHome";

// Lazy loading wrapper
const Suspend = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
    {children}
  </React.Suspense>
);

// All other public pages — lazy loaded
const Auth = React.lazy(() => import("@/pages/Auth"));
const AuthCallback = React.lazy(() => import("@/pages/AuthCallback"));
const ResetPassword = React.lazy(() => import("@/pages/ResetPassword"));
const DemoLogin = React.lazy(() => import("@/pages/DemoLogin"));
const InsiderDemo = React.lazy(() => import("@/pages/InsiderDemo"));
const Install = React.lazy(() => import("@/pages/Install"));
const HowItWorks = React.lazy(() => import("@/pages/HowItWorks"));
const FAQ = React.lazy(() => import("@/pages/FAQ"));
const Terms = React.lazy(() => import("@/pages/Terms"));
const Privacy = React.lazy(() => import("@/pages/Privacy"));
const Pricing = React.lazy(() => import("@/pages/Pricing"));
const Contact = React.lazy(() => import("@/pages/Contact"));
const About = React.lazy(() => import("@/pages/About"));
const Waitlist = React.lazy(() => import("@/pages/Waitlist"));
const Press = React.lazy(() => import("@/pages/Press"));
const ForArtists = React.lazy(() => import("@/pages/ForArtists"));
const ForEngineers = React.lazy(() => import("@/pages/ForEngineers"));
const ForProducers = React.lazy(() => import("@/pages/ForProducers"));
const ForFans = React.lazy(() => import("@/pages/ForFans"));
const ForCreatives = React.lazy(() => import("@/pages/ForCreatives"));
const Premieres = React.lazy(() => import("@/pages/Premieres"));
const Community = React.lazy(() => import("@/pages/Community"));
const LivePage = React.lazy(() => import("@/pages/LivePage"));
const Achievements = React.lazy(() => import("@/pages/Achievements"));
const PrimeBeatForge = React.lazy(() => import("@/pages/PrimeBeatForge"));
const PublicProfile = React.lazy(() => import("@/pages/PublicProfile"));
const PromoFunnel = React.lazy(() => import("@/pages/PromoFunnel"));
const QuickStart = React.lazy(() => import("@/pages/QuickStart"));
const EconomyPublic = React.lazy(() => import("@/pages/EconomyPublic"));
const Services = React.lazy(() => import("@/pages/Services"));
const MixingShowcase = React.lazy(() => import("@/pages/MixingShowcase"));
const MasteringShowcase = React.lazy(() => import("@/pages/MasteringShowcase"));
const AIMastering = React.lazy(() => import("@/pages/AIMastering"));
const DistributionHub = React.lazy(() => import("@/pages/DistributionHub"));
const Showcase = React.lazy(() => import("@/pages/Showcase"));
const BeatMarketplace = React.lazy(() => import("@/pages/BeatMarketplace"));
const LandingPageView = React.lazy(() => import("@/pages/LandingPageView"));

export const publicRoutes = (
  <>
    {/* Marketing / Public Routes */}
    <Route path="/" element={<MixClubHome />} />
    <Route path={ROUTES.PROMO_FUNNEL} element={<Suspend><PromoFunnel /></Suspend>} />
    <Route path={ROUTES.AUTH} element={<Suspend><Auth /></Suspend>} />
    <Route path={ROUTES.AUTH_CALLBACK} element={<Suspend><AuthCallback /></Suspend>} />
    <Route path="/reset-password" element={<Suspend><ResetPassword /></Suspend>} />
    <Route path="/demo-login" element={<Suspend><DemoLogin /></Suspend>} />
    <Route path="/insider-demo" element={<Suspend><InsiderDemo /></Suspend>} />
    <Route path="/start" element={<Suspend><QuickStart /></Suspend>} />
    <Route path="/install" element={<Suspend><Install /></Suspend>} />
    
    <Route path="/home" element={<Suspend><HowItWorks /></Suspend>} />
    <Route path={ROUTES.HOW_IT_WORKS} element={<Navigate to="/home" replace />} />
    <Route path="/faq" element={<Suspend><FAQ /></Suspend>} />
    <Route path="/terms" element={<Suspend><Terms /></Suspend>} />
    <Route path="/privacy" element={<Suspend><Privacy /></Suspend>} />
    <Route path="/pricing" element={<Suspend><Pricing /></Suspend>} />
    <Route path="/contact" element={<Suspend><Contact /></Suspend>} />
    <Route path="/about" element={<Suspend><About /></Suspend>} />
    <Route path="/waitlist" element={<Suspend><Waitlist /></Suspend>} />
    <Route path="/press" element={<Suspend><Press /></Suspend>} />
    <Route path="/for-artists" element={<Suspend><ForArtists /></Suspend>} />
    <Route path="/for-engineers" element={<Suspend><ForEngineers /></Suspend>} />
    <Route path="/for-producers" element={<Suspend><ForProducers /></Suspend>} />
    <Route path="/for-fans" element={<Suspend><ForFans /></Suspend>} />
    <Route path={ROUTES.FOR_CREATIVES} element={<Suspend><ForCreatives /></Suspend>} />
    
    {/* Studio & Services — Public showcase */}
    <Route path={ROUTES.SERVICES} element={<Suspend><Services /></Suspend>} />
    <Route path={ROUTES.SERVICES_MIXING} element={<Suspend><MixingShowcase /></Suspend>} />
    <Route path={ROUTES.SERVICES_MASTERING} element={<Suspend><MasteringShowcase /></Suspend>} />
    <Route path={ROUTES.SERVICES_AI_MASTERING} element={<Suspend><AIMastering /></Suspend>} />
    <Route path={ROUTES.SERVICES_DISTRIBUTION} element={<Suspend><DistributionHub /></Suspend>} />
    <Route path={ROUTES.SHOWCASE} element={<Suspend><Showcase /></Suspend>} />
    
    {/* Marketplace — Public showcase */}
    <Route path={ROUTES.MARKETPLACE} element={<Suspend><BeatMarketplace /></Suspend>} />
    <Route path={ROUTES.BEATS} element={<Suspend><BeatMarketplace /></Suspend>} />

    {/* Mixxclub platform routes - public */}
    <Route path="/premieres" element={<Suspend><Premieres /></Suspend>} />
    <Route path="/community" element={<Suspend><Community /></Suspend>} />
    <Route path="/live" element={<Suspend><LivePage /></Suspend>} />
    <Route path="/achievements" element={<Suspend><Achievements /></Suspend>} />
    <Route path="/beat-forge" element={<Suspend><PrimeBeatForge /></Suspend>} />
    <Route path={ROUTES.ECONOMY} element={<Suspend><EconomyPublic /></Suspend>} />
    <Route path="/u/:username" element={<Suspend><PublicProfile /></Suspend>} />

    {/* Dynamic landing pages from block builder */}
    <Route path="/p/:slug" element={<Suspend><LandingPageView /></Suspend>} />
  </>
);
