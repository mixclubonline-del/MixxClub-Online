import { 
  Upload, 
  Sparkles, 
  Users, 
  Download, 
  Headphones,
  Award,
  TrendingUp,
  Music,
  Share2,
  Crown,
  Star,
  Trophy,
  Play
} from "lucide-react";
import { LandingPortal } from "@/components/landing/LandingPortal";
import { PortalHero } from "@/components/landing/PortalHero";
import { JourneyPreview } from "@/components/landing/JourneyPreview";
import { FeatureGlassCards } from "@/components/landing/FeatureGlassCards";
import { PortalInvitation } from "@/components/landing/PortalInvitation";
import { FoundingBanner } from "@/components/landing/FoundingBanner";
import { SessionPreview } from "@/components/home/SessionPreview";
import { TransformationDemo } from "@/components/home/TransformationDemo";
import portalArtistImage from "@/assets/portal-artist.jpg";

const ForArtists = () => {
  const journeySteps = [
    {
      number: 1,
      icon: <Upload className="w-6 h-6" />,
      title: "Upload Your Track",
      description: "Drop your stems or mixdown into our secure cloud workspace"
    },
    {
      number: 2,
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Session Prep",
      description: "Our AI analyzes your track and prepares detailed session notes"
    },
    {
      number: 3,
      icon: <Users className="w-6 h-6" />,
      title: "Perfect Match",
      description: "Get paired with an engineer who specializes in your genre"
    },
    {
      number: 4,
      icon: <Headphones className="w-6 h-6" />,
      title: "Real-Time Collaboration",
      description: "Work together in our live studio workspace with instant feedback"
    },
    {
      number: 5,
      icon: <Download className="w-6 h-6" />,
      title: "Professional Delivery",
      description: "Receive your polished mix/master in all required formats"
    },
    {
      number: 6,
      icon: <Share2 className="w-6 h-6" />,
      title: "Release & Grow",
      description: "Distribute to all platforms and track your success"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Artists Trust MixClub" },
    { value: "2.3 sec", label: "Average Match Time" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Global Collaboration" },
  ];

  const crmFeatures = [
    { icon: TrendingUp, title: "Dashboard", description: "Track your career momentum and key metrics" },
    { icon: Users, title: "Sessions", description: "Manage all your collaboration sessions" },
    { icon: Sparkles, title: "AI Matching", description: "Find the perfect engineer for your sound" },
    { icon: Headphones, title: "Projects", description: "Track every project from upload to release" },
    { icon: Award, title: "Achievements", description: "Earn badges and unlock rewards" },
    { icon: Trophy, title: "Community", description: "Connect with other artists and grow together" },
  ];

  return (
    <LandingPortal backgroundImage={portalArtistImage} variant="artist">
      {/* Founding Member Banner */}
      <FoundingBanner
        icon={<Crown className="w-6 h-6 text-amber-400" />}
        text="🚀 Founding Artist Program - First 100 get"
        highlight="lifetime 20% discount"
        badge="73 spots left"
        variant="artist"
      />

      {/* Hero Section */}
      <PortalHero
        badge={{ icon: <Music className="w-4 h-4" />, text: "For Artists" }}
        title="Turn Bedroom Beats Into Billboard Bangers"
        subtitle="Professional mixing, AI-powered mastering, and real-time collaboration with world-class engineers."
        stats={stats}
        primaryAction={{
          text: "Start Your Journey Free",
          icon: <Sparkles className="w-5 h-5" />,
          href: "/auth?mode=signup"
        }}
        secondaryAction={{
          text: "See The Technology",
          icon: <Play className="w-5 h-5" />,
          href: "/showcase"
        }}
        variant="artist"
      />

      {/* Live Session Preview */}
      <div className="relative z-10">
        <SessionPreview />
      </div>

      {/* Before/After Transformation */}
      <div className="relative z-10">
        <TransformationDemo />
      </div>

      {/* The Journey Section */}
      <JourneyPreview
        badge={{ icon: <Star className="w-4 h-4" />, text: "Your Path to Success" }}
        title="From Upload to Release"
        subtitle="We've streamlined the entire production process."
        steps={journeySteps}
        variant="artist"
      />

      {/* CRM Preview Section */}
      <FeatureGlassCards
        badge={{ icon: <Star className="w-4 h-4" />, text: "Your Command Center" }}
        title="This is YOUR Artist CRM"
        subtitle="Everything you need to manage your music career in one place."
        features={crmFeatures}
        variant="artist"
      />

      {/* Final CTA - Portal Invitation */}
      <PortalInvitation
        icon={<Crown className="w-10 h-10" />}
        title="Ready to Elevate Your Music?"
        subtitle="Join thousands of artists who've transformed their sound."
        cta={{ text: "Start Free Today", href: "/auth?mode=signup" }}
        variant="artist"
        disclaimer="No credit card required • Cancel anytime • 30-day money-back guarantee"
      />
    </LandingPortal>
  );
};

export default ForArtists;
