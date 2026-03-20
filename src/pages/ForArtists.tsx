import { SEOHead } from '@/components/SEOHead';
import { PublicFooter } from '@/components/layouts/PublicFooter';
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
  Play,
  Coins,
  Radio
} from "lucide-react";
import { LandingPortal } from "@/components/landing/LandingPortal";
import { PortalHero } from "@/components/landing/PortalHero";
import { ShowcaseJourney, ShowcaseStep } from "@/components/landing/ShowcaseJourney";
import { ShowcaseFeature } from "@/components/services/ShowcaseFeature";
import { PortalInvitation } from "@/components/landing/PortalInvitation";
import { FoundingBanner } from "@/components/landing/FoundingBanner";
import { SessionPreview } from "@/components/home/SessionPreview";
import { TransformationDemo } from "@/components/home/TransformationDemo";
import { ScrollRevealSection } from "@/components/landing/ScrollRevealSection";
import { FAQSection } from "@/components/seo/FAQSection";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/navigation/BackButton";
import portalArtistFallback from "@/assets/portal-artist.jpg";
import { usePageContent, usePageImage } from '@/hooks/usePageContent';

// Journey Images
import artistUploadCloud from "@/assets/promo/artist-upload-cloud.jpg";
import artistAiAnalysis from "@/assets/promo/artist-ai-analysis.jpg";
import artistEngineerMatch from "@/assets/promo/artist-engineer-match.jpg";
import artistLiveCollab from "@/assets/promo/artist-live-collab.jpg";
import artistDelivery from "@/assets/promo/artist-delivery.jpg";
import artistReleaseGrowth from "@/assets/promo/artist-release-growth.jpg";

// CRM Images
import artistCrmDashboard from "@/assets/promo/artist-crm-dashboard.jpg";
import artistCrmSessions from "@/assets/promo/artist-crm-sessions.jpg";
import artistCrmProjects from "@/assets/promo/artist-crm-projects.jpg";
import artistCrmCommunity from "@/assets/promo/artist-crm-community.jpg";

const ForArtists = () => {
  const { content: heroTitle } = usePageContent('for-artists', 'hero_title');
  const { content: heroSubtitle } = usePageContent('for-artists', 'hero_subtitle');
  const { content: heroBadge } = usePageContent('for-artists', 'hero_badge');
  const { imageUrl: portalArtistImage } = usePageImage('for-artists', 'hero_image', portalArtistFallback);
  const journeySteps: ShowcaseStep[] = [
    {
      image: artistUploadCloud,
      icon: Upload,
      stepNumber: 1,
      title: "Upload Your Track",
      description: "Drop your stems or mixdown into our secure cloud workspace. Supports all major formats with unlimited storage and automatic backup.",
      stats: [
        { label: "Formats", value: "15+" },
        { label: "Max Size", value: "2GB" },
        { label: "Storage", value: "∞" }
      ],
      techDetails: ["Lossless Upload", "Stem Detection", "Auto-Organize", "Version Control"]
    },
    {
      image: artistAiAnalysis,
      icon: Sparkles,
      stepNumber: 2,
      title: "AI Session Prep",
      description: "Our AI analyzes your track and prepares detailed session notes, identifying genre, key, BPM, and potential mixing opportunities.",
      stats: [
        { label: "Analysis", value: "<30s" },
        { label: "Accuracy", value: "99.2%" },
        { label: "Insights", value: "25+" }
      ],
      techDetails: ["Neural Analysis", "Genre Detection", "Session Notes", "Mix Suggestions"]
    },
    {
      image: artistEngineerMatch,
      icon: Users,
      stepNumber: 3,
      title: "Perfect Match",
      description: "Get paired with an engineer who specializes in your genre and style. Our matching algorithm considers skill, availability, and past collaborations.",
      stats: [
        { label: "Match Time", value: "2.3s" },
        { label: "Success Rate", value: "98%" },
        { label: "Engineers", value: "2,500+" }
      ],
      techDetails: ["AI Matching", "Genre Specialists", "Style Analysis", "Verified Pros"]
    },
    {
      image: artistLiveCollab,
      icon: Headphones,
      stepNumber: 4,
      title: "Real-Time Collaboration",
      description: "Work together in our live studio workspace with instant feedback. See changes in real-time, communicate via video, and approve every decision.",
      stats: [
        { label: "Latency", value: "<50ms" },
        { label: "Video HD", value: "1080p" },
        { label: "Regions", value: "Global" }
      ],
      techDetails: ["Live Audio", "HD Video", "Real-Time DAW", "Instant Feedback"]
    },
    {
      image: artistDelivery,
      icon: Download,
      stepNumber: 5,
      title: "Professional Delivery",
      description: "Receive your polished mix/master in all required formats. Every deliverable is quality-checked and ready for distribution.",
      stats: [
        { label: "Formats", value: "8+" },
        { label: "Quality", value: "32-bit" },
        { label: "Delivery", value: "24h" }
      ],
      techDetails: ["Multi-Format", "Quality Check", "Stems Included", "Instant Download"]
    },
    {
      image: artistReleaseGrowth,
      icon: Share2,
      stepNumber: 6,
      title: "Release & Grow",
      description: "Distribute to all platforms and track your success. Access analytics, playlist pitching tools, and growth resources.",
      stats: [
        { label: "Platforms", value: "150+" },
        { label: "Analytics", value: "Real-Time" },
        { label: "Support", value: "24/7" }
      ],
      techDetails: ["Distribution", "Analytics", "Playlist Tools", "Growth Academy"]
    }
  ];

  const crmFeatures = [
    {
      image: artistCrmDashboard,
      icon: TrendingUp,
      title: "Career Dashboard",
      subtitle: "Command Center",
      description: "Track your career momentum with real-time metrics. See streaming numbers, earnings, session history, and achievement progress all in one beautiful interface.",
      stats: [
        { label: "Metrics", value: "50+" },
        { label: "Updates", value: "Real-Time" },
        { label: "History", value: "Unlimited" }
      ],
      techDetails: ["Live KPIs", "Earnings Tracker", "Goal Setting", "AI Insights"]
    },
    {
      image: artistCrmSessions,
      icon: Headphones,
      title: "Session Management",
      subtitle: "Collaboration Hub",
      description: "Manage all your collaboration sessions from scheduling to completion. Track progress, communicate with engineers, and access session recordings.",
      stats: [
        { label: "Active", value: "Unlimited" },
        { label: "History", value: "Forever" },
        { label: "Video", value: "Included" }
      ],
      techDetails: ["Calendar Sync", "Session Timeline", "Engineer Chat", "Recording Archive"]
    },
    {
      image: artistCrmProjects,
      icon: Music,
      title: "Project Tracker",
      subtitle: "From Upload to Release",
      description: "Track every project from initial upload through release. See milestones, manage versions, and never lose track of where your music stands.",
      stats: [
        { label: "Projects", value: "Unlimited" },
        { label: "Versions", value: "Auto-Saved" },
        { label: "Milestones", value: "12/Track" }
      ],
      techDetails: ["Version Control", "Milestone Tracking", "Release Pipeline", "Asset Library"]
    },
    {
      image: artistCrmCommunity,
      icon: Trophy,
      title: "Community & Achievements",
      subtitle: "Grow Together",
      description: "Connect with other artists, earn achievements, and unlock rewards. Your journey is celebrated every step of the way.",
      stats: [
        { label: "Badges", value: "100+" },
        { label: "Rewards", value: "Exclusive" },
        { label: "Network", value: "10,000+" }
      ],
      techDetails: ["Achievement System", "XP Progression", "MixxCoinz Economy", "Premieres"]
    },
    {
      image: artistCrmDashboard,
      icon: Coins,
      title: "MixxCoinz Rewards",
      subtitle: "Own Your Engagement",
      description: "Every stream, session, and milestone earns MixxCoinz — our platform currency. Spend on services, unlock tier discounts up to 15%, and cash out at 200:1.",
      stats: [
        { label: "Earn Rate", value: "Every Action" },
        { label: "Max Discount", value: "15%" },
        { label: "Cashout", value: "200:1" }
      ],
      techDetails: ["Earned & Purchased", "Tier Discounts", "Cashout to USD", "Permanent Ownership"]
    },
    {
      image: artistCrmSessions,
      icon: Radio,
      title: "Premieres & First Listens",
      subtitle: "Exclusive Early Access",
      description: "Drop new tracks to your most loyal fans first. Premieres build hype, reward Day 1 supporters, and drive engagement before the public release.",
      stats: [
        { label: "Early Access", value: "48h" },
        { label: "Fan Reactions", value: "Real-Time" },
        { label: "Hype Score", value: "AI" }
      ],
      techDetails: ["Timed Exclusives", "Fan Backing", "Hype Analytics", "Pre-Save Integration"]
    }
  ];

  const stats = [
    { value: "10,000+", label: "Artists Trust Mixxclub" },
    { value: "2.3 sec", label: "Average Match Time" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Global Collaboration" },
  ];

  return (
    <>
      <SEOHead
        title="For Artists"
        description="Upload your track, get AI-matched with professional engineers, and collaborate in real-time. From bedroom to billboard — starting at $29."
        keywords="music artists, professional mixing, mastering for artists, ai engineer matching, music production"
      />
      <LandingPortal backgroundImage={portalArtistImage} variant="artist">
      <BackButton />
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
        badge={{ icon: <Music className="w-4 h-4" />, text: heroBadge }}
        title={heroTitle}
        subtitle={heroSubtitle}
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

      {/* The Journey Section - Upgraded to ShowcaseJourney */}
      <ShowcaseJourney
        badge={{ icon: <Star className="w-4 h-4" />, text: "Your Path to Success" }}
        title="From Upload to Release"
        subtitle="We've streamlined the entire production process into six powerful steps."
        steps={journeySteps}
        variant="artist"
      />

      {/* CRM Preview Section - Upgraded to ShowcaseFeature */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <ScrollRevealSection className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 bg-background/30 backdrop-blur-md border-white/20"
            >
              <Star className="w-4 h-4" />
              <span className="ml-2">Your Command Center</span>
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">This is YOUR Artist CRM</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your music career in one place.
            </p>
          </ScrollRevealSection>

          <div className="space-y-24">
            {crmFeatures.map((feature, index) => (
              <ShowcaseFeature
                key={feature.title}
                {...feature}
                reversed={index % 2 !== 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-background/80">
        <FAQSection
          faqs={[
            { question: 'How do I get matched with the right engineer for my sound?', answer: 'When you upload a track, our AI analyzes its genre, tempo, key, and spectral characteristics. We then match you with verified engineers who specialize in your style. You can review their portfolios, ratings, and past work before accepting a match.' },
            { question: 'What audio formats can I upload?', answer: 'Mixxclub accepts WAV, MP3, FLAC, AIFF, and OGG files. For the best results, upload uncompressed WAV files at 24-bit/44.1kHz or higher. You can also upload reference tracks to help your engineer understand your vision.' },
            { question: 'How long does a mixing project take?', answer: 'Turnaround depends on your package. Standard mixing is delivered in 3 business days, while rush options deliver in 24 hours. Complex multi-track projects may take up to 5 days. You will receive progress updates throughout the process.' },
            { question: 'Can I distribute my finished tracks through Mixxclub?', answer: 'Yes. Mixxclub integrates with distribution partners to get your music on 150+ streaming platforms including Spotify, Apple Music, Tidal, and Amazon Music. Distribution plans start at $19.99/year.' },
            { question: 'What are MixxCoinz and how do I earn them as an artist?', answer: 'MixxCoinz are Mixxclub\'s platform currency. Artists earn them by uploading tracks, completing collaborations, engaging with the community, and reaching milestones. You can spend MixxCoinz on services or save them to unlock permanent platform perks.' },
          ]}
          title="Questions for Artists"
        />
      </section>

      {/* Final CTA - Portal Invitation */}
      <PortalInvitation
        icon={<Crown className="w-10 h-10" />}
        title="Ready to Elevate Your Music?"
        subtitle="Join thousands of artists who've transformed their sound."
        cta={{ text: "Start Free Today", href: "/auth?mode=signup" }}
        variant="artist"
        disclaimer="No credit card required • Cancel anytime • 30-day money-back guarantee"
      />
      <PublicFooter />
    </LandingPortal>
    </>
  );
};

export default ForArtists;
