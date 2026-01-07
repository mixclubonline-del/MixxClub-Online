import React from "react";
import { Route, Navigate } from "react-router-dom";

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
import Showcase from "@/pages/Showcase";
import Artist from "@/pages/Artist";
import Engineer from "@/pages/Engineer";
import NotFound from "@/pages/NotFound";

// Lazy loaded public pages
const MixClubHome = React.lazy(() => import("@/pages/MixClubHome"));
const LaunchWaitlist = React.lazy(() => import("@/pages/LaunchWaitlist"));
const Enterprise = React.lazy(() => import("@/pages/Enterprise"));

export const publicRoutes = (
  <>
    <Route path="/" element={<InsiderDemo />} />
    <Route path="/mixclub" element={<MixClubHome />} />
    <Route path="/launch" element={<InsiderDemo />} />
    <Route path="/home" element={<MixClubHome />} />
    <Route path="/install" element={<Install />} />
    <Route path="/network" element={<Navigate to="/" replace />} />
    <Route path="/artist" element={<Artist />} />
    <Route path="/engineer" element={<Engineer />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/demo" element={<DemoLogin />} />
    <Route path="/insider-demo" element={<InsiderDemo />} />
    <Route path="/how-it-works" element={<HowItWorks />} />
    <Route path="/showcase" element={<Showcase />} />
    <Route path="/for-artists" element={<ForArtists />} />
    <Route path="/for-engineers" element={<ForEngineers />} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/about" element={<About />} />
    <Route path="/waitlist" element={<Waitlist />} />
    <Route path="/press" element={<Press />} />
    <Route path="/enterprise" element={<Enterprise />} />
  </>
);
