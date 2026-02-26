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
import ForProducers from "@/pages/ForProducers";
import ForFans from "@/pages/ForFans";
import ChoosePath from "@/pages/ChoosePath";
import Showcase from "@/pages/Showcase";
import Artist from "@/pages/Artist";
import Engineer from "@/pages/Engineer";
import NotFound from "@/pages/NotFound";
import { WaitlistGate } from "@/components/waitlist/WaitlistGate";

// Lazy loaded public pages
const MixClubHome = React.lazy(() => import("@/pages/MixClubHome"));
const Enterprise = React.lazy(() => import("@/pages/Enterprise"));

export const publicRoutes = (
  <>
    {/* Main entry point - MixClub platform */}
    <Route path="/" element={<MixClubHome />} />
    <Route path="/home" element={<Navigate to="/" replace />} />
    <Route path="/mixclub" element={<Navigate to="/" replace />} />

    {/* Demo/Showcase - parked for demos */}
    <Route path="/demo" element={<InsiderDemo />} />
    <Route path="/insider-demo" element={<InsiderDemo />} />

    {/* Waitlist - keep for existing signups */}
    <Route path="/waitlist" element={<Waitlist />} />

    {/* Standard public pages */}
    <Route path="/install" element={<Install />} />
    <Route path="/network" element={<Navigate to="/" replace />} />
    <Route path="/artist" element={<Artist />} />
    <Route path="/engineer" element={<Engineer />} />
    <Route path="/how-it-works" element={<HowItWorks />} />
    <Route path="/showcase" element={<Showcase />} />
    <Route path="/for-artists" element={<ForArtists />} />
    <Route path="/for-engineers" element={<ForEngineers />} />
    <Route path="/for-producers" element={<ForProducers />} />
    <Route path="/for-fans" element={<ForFans />} />
    <Route path="/choose-path" element={<WaitlistGate><ChoosePath /></WaitlistGate>} />
    <Route path="/request-access" element={<WaitlistGate forceCapture><div /></WaitlistGate>} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/about" element={<About />} />
    <Route path="/press" element={<Press />} />
    <Route path="/enterprise" element={<Enterprise />} />

    {/* Auth & Legal */}
    <Route path="/auth" element={<Auth />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/~oauth" element={<AuthCallback />} />
    <Route path="/~oauth/callback" element={<AuthCallback />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />
  </>
);
