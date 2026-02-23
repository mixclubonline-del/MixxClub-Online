import { useState } from "react";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import { SEOHead } from "@/components/SEOHead";
import { Upload, Sparkles, Users, Headphones, Download, UserPlus, Briefcase, Zap, DollarSign, Star, Disc3, Search, Coins, Eye, Award, UserCircle, Flame, Heart, Radio, Trophy } from "lucide-react";
import Navigation from "@/components/Navigation";
import JourneyPortal from "@/components/journey/JourneyPortal";
import PathAmbience from "@/components/journey/PathAmbience";
import JourneyGateway from "@/components/journey/JourneyGateway";
import type { JourneyRole } from "@/components/journey/JourneyGateway";
import JourneyDestination from "@/components/journey/JourneyDestination";
import EcosystemFlow from "@/components/journey/EcosystemFlow";
import { ShowcaseJourney, ShowcaseStep } from "@/components/services/ShowcaseJourney";
import journeyPathImage from "@/assets/journey-path.jpg";

// Artist journey images
import journeyArtistUpload from "@/assets/promo/journey-artist-upload.jpg";
import journeyArtistAi from "@/assets/promo/journey-artist-ai.jpg";
import journeyArtistMatch from "@/assets/promo/journey-artist-match.jpg";
import journeyArtistCollab from "@/assets/promo/journey-artist-collab.jpg";
import journeyArtistDownload from "@/assets/promo/journey-artist-download.jpg";

// Engineer journey images
import journeyEngineerProfile from "@/assets/promo/journey-engineer-profile.jpg";
import journeyEngineerMatch from "@/assets/promo/journey-engineer-match.jpg";
import journeyEngineerWork from "@/assets/promo/journey-engineer-work.jpg";
import journeyEngineerEarn from "@/assets/promo/journey-engineer-earn.jpg";

// Producer journey images (reusing relevant promo assets)
import producerUpload from "@/assets/promo/artist-upload-cloud.jpg";
import producerAi from "@/assets/promo/ai-track-analysis.jpg";
import producerMatch from "@/assets/promo/artist-engineer-match.jpg";
import producerSession from "@/assets/promo/mixing-console-close.jpg";
import producerEarn from "@/assets/promo/engineer-revenue-streams.jpg";

// Fan journey images (reusing relevant promo assets)
import fanProfile from "@/assets/promo/ai-instant-analysis.jpg";
import fanDiscover from "@/assets/promo/mixing-realtime-feedback.jpg";
import fanBack from "@/assets/promo/artist-release-growth.jpg";
import fanWatch from "@/assets/promo/webrtc-collaboration.jpg";
import fanEarn from "@/assets/promo/artist-crm-community.jpg";

// --- Artist Steps ---
const artistShowcaseSteps: ShowcaseStep[] = [
  {
    image: journeyArtistUpload, icon: Upload, stepNumber: 1,
    title: "Upload Your Track",
    description: "Drag and drop your audio file into our secure cloud. We support all major formats including WAV, MP3, AIFF, and FLAC with lossless quality preservation.",
    stats: [{ label: "Formats", value: "15+" }, { label: "Max Size", value: "2GB" }, { label: "Time", value: "2 min" }],
    techDetails: ["Lossless Upload", "Auto-Organize", "Secure Cloud", "Stem Detection"],
  },
  {
    image: journeyArtistAi, icon: Sparkles, stepNumber: 2,
    title: "AI Analyzes Your Sound",
    description: "Our AI profiles your track's genre, mood, key, tempo, and technical needs to find the perfect engineer match for your unique sound.",
    stats: [{ label: "Analysis", value: "Instant" }, { label: "Accuracy", value: "98%" }, { label: "Genres", value: "50+" }],
    techDetails: ["Genre Detection", "Mood Analysis", "Key & Tempo", "Reference Matching"],
  },
  {
    image: journeyArtistMatch, icon: Users, stepNumber: 3,
    title: "Get Matched with Engineers",
    description: "We connect you with verified engineers who specialize in your sound and style. Review portfolios, ratings, and choose your perfect collaborator.",
    stats: [{ label: "Engineers", value: "500+" }, { label: "Match Rate", value: "95%" }, { label: "Response", value: "<1hr" }],
    techDetails: ["AI Matching", "Verified Profiles", "Portfolio Reviews", "Instant Connect"],
  },
  {
    image: journeyArtistCollab, icon: Headphones, stepNumber: 4,
    title: "Collaborate in Real-Time",
    description: "Work together in our collaborative workspace with live feedback, version control, and unlimited revisions until your track sounds perfect.",
    stats: [{ label: "Revisions", value: "∞" }, { label: "Turnaround", value: "1-3 days" }, { label: "Latency", value: "<50ms" }],
    techDetails: ["Live Sessions", "Version Control", "Reference Tracks", "Chat & Video"],
  },
  {
    image: journeyArtistDownload, icon: Download, stepNumber: 5,
    title: "Download Your Hit",
    description: "Get your radio-ready master in multiple formats. Share directly to streaming platforms or download high-resolution files for distribution.",
    stats: [{ label: "Formats", value: "All" }, { label: "Quality", value: "24-bit" }, { label: "Delivery", value: "Instant" }],
    techDetails: ["Multi-Format", "Streaming Ready", "Master Files", "Distribution"],
  },
];

// --- Engineer Steps ---
const engineerShowcaseSteps: ShowcaseStep[] = [
  {
    image: journeyEngineerProfile, icon: UserPlus, stepNumber: 1,
    title: "Create Your Profile",
    description: "Showcase your portfolio, certifications, and expertise. Set your rates, availability, and let our AI optimize your profile for discovery.",
    stats: [{ label: "Setup", value: "15 min" }, { label: "Portfolio", value: "∞ tracks" }, { label: "Visibility", value: "Global" }],
    techDetails: ["Portfolio Hosting", "Rate Setting", "Specialty Tags", "AI Optimization"],
  },
  {
    image: journeyEngineerMatch, icon: Briefcase, stepNumber: 2,
    title: "Get Matched with Artists",
    description: "Browse opportunities or get automatically matched with artists who fit your style. Accept projects that excite you and fit your schedule.",
    stats: [{ label: "Projects", value: "100+/day" }, { label: "Match Quality", value: "95%" }, { label: "Response", value: "Flexible" }],
    techDetails: ["AI Matching", "Project Filters", "Genre Preferences", "Availability Sync"],
  },
  {
    image: journeyEngineerWork, icon: Zap, stepNumber: 3,
    title: "Work Your Magic",
    description: "Use our professional cloud tools or your own DAW. Artists see progress in real-time, leave comments, and approve revisions seamlessly.",
    stats: [{ label: "Cloud Tools", value: "Pro Grade" }, { label: "Plugins", value: "100+" }, { label: "Storage", value: "∞" }],
    techDetails: ["Cloud DAW", "Plugin Suite", "Version Control", "Client Sync"],
  },
  {
    image: journeyEngineerEarn, icon: DollarSign, stepNumber: 4,
    title: "Earn 70% Revenue",
    description: "Keep 70% of every project. Get paid instantly when projects complete. Build your reputation with verified reviews and grow your client base.",
    stats: [{ label: "Revenue", value: "70%" }, { label: "Payout", value: "Same day" }, { label: "Reviews", value: "Verified" }],
    techDetails: ["Instant Payouts", "Revenue Dashboard", "Client CRM", "Growth Analytics"],
  },
];

// --- Producer Steps ---
const producerShowcaseSteps: ShowcaseStep[] = [
  {
    image: producerUpload, icon: Upload, stepNumber: 1,
    title: "Upload Your Beats",
    description: "Drop instrumentals, loops, and stems into your beat vault. Genre, mood, BPM, and key are tagged automatically via AI — zero manual work.",
    stats: [{ label: "Formats", value: "All" }, { label: "AI Tags", value: "Instant" }, { label: "Storage", value: "∞" }],
    techDetails: ["Beat Vault", "Auto-Tagging", "Stem Upload", "Bulk Import"],
  },
  {
    image: producerAi, icon: Sparkles, stepNumber: 2,
    title: "AI Catalogs Your Sound",
    description: "Our AI profiles your production style, creates a sonic fingerprint, and optimizes discoverability across the marketplace so the right artists find you.",
    stats: [{ label: "Fingerprint", value: "Unique" }, { label: "Discovery", value: "3x boost" }, { label: "Accuracy", value: "97%" }],
    techDetails: ["Sonic Fingerprint", "Style Profiling", "SEO Boost", "Smart Categorize"],
  },
  {
    image: producerMatch, icon: Search, stepNumber: 3,
    title: "Artists Find Your Beats",
    description: "Matched artists browse, preview, and license your beats. You set the terms: exclusive, non-exclusive, lease, or custom deals.",
    stats: [{ label: "License Types", value: "4" }, { label: "Artists", value: "10K+" }, { label: "Preview", value: "Instant" }],
    techDetails: ["Licensing Engine", "Custom Terms", "Preview Player", "Beat Store"],
  },
  {
    image: producerSession, icon: Eye, stepNumber: 4,
    title: "Track the Session",
    description: "Watch your beat come to life. See who's mixing it, follow the project progress, and get credited automatically on every release.",
    stats: [{ label: "Live View", value: "Real-time" }, { label: "Credits", value: "Auto" }, { label: "Updates", value: "Instant" }],
    techDetails: ["Session Tracking", "Auto-Credit", "Progress Feed", "Collaboration"],
  },
  {
    image: producerEarn, icon: Coins, stepNumber: 5,
    title: "Earn Royalties Forever",
    description: "Every stream, every sync, every placement — your royalties flow automatically. Build passive income from your growing catalog.",
    stats: [{ label: "Royalties", value: "Lifetime" }, { label: "Platforms", value: "All" }, { label: "Payout", value: "Monthly" }],
    techDetails: ["Royalty Tracking", "Sync Licensing", "Catalog Growth", "Revenue Dashboard"],
  },
];

// --- Fan Steps ---
const fanShowcaseSteps: ShowcaseStep[] = [
  {
    image: fanProfile, icon: UserCircle, stepNumber: 1,
    title: "Create Your Listener Profile",
    description: "Tell us your taste. Our AI builds a sonic fingerprint from your listening habits and favorite genres to unlock personalized discovery.",
    stats: [{ label: "Setup", value: "2 min" }, { label: "Genres", value: "50+" }, { label: "AI Match", value: "Instant" }],
    techDetails: ["Taste Profile", "Genre Map", "Listening DNA", "Smart Recs"],
  },
  {
    image: fanDiscover, icon: Flame, stepNumber: 2,
    title: "Discover Unreleased Heat",
    description: "Get early access to tracks still in the studio. Preview works-in-progress before anyone else hears them — be the first to know.",
    stats: [{ label: "Early Access", value: "24hr+" }, { label: "Exclusives", value: "Daily" }, { label: "Previews", value: "∞" }],
    techDetails: ["Early Access", "WIP Previews", "Exclusive Drops", "Curator Feed"],
  },
  {
    image: fanBack, icon: Heart, stepNumber: 3,
    title: "Back Projects You Believe In",
    description: "Invest your attention and MixxCoinz into artists and projects. Your engagement drives their visibility and earns you rewards.",
    stats: [{ label: "MixxCoinz", value: "Earn & Spend" }, { label: "Impact", value: "Direct" }, { label: "Rewards", value: "Tiered" }],
    techDetails: ["MixxCoinz", "Fan Missions", "Engagement Score", "Artist Boost"],
  },
  {
    image: fanWatch, icon: Radio, stepNumber: 4,
    title: "Watch Music Get Made",
    description: "Follow sessions in real-time. See the mixing process, vote on versions, and influence the final sound of tracks you care about.",
    stats: [{ label: "Live", value: "Real-time" }, { label: "Voting", value: "Active" }, { label: "Sessions", value: "∞" }],
    techDetails: ["Live Sessions", "Version Voting", "Behind-the-Scenes", "Fan Input"],
  },
  {
    image: fanEarn, icon: Trophy, stepNumber: 5,
    title: "Earn as a Tastemaker",
    description: "Your early picks that blow up earn you MixxCoinz, exclusive drops, and Tastemaker status in the community. Your taste has value.",
    stats: [{ label: "Earn", value: "MixxCoinz" }, { label: "Status", value: "Tastemaker" }, { label: "Perks", value: "Exclusive" }],
    techDetails: ["Tastemaker Tier", "Coinz Rewards", "Exclusive Drops", "Leaderboard"],
  },
];

const stepsMap: Record<JourneyRole, ShowcaseStep[]> = {
  artist: artistShowcaseSteps,
  engineer: engineerShowcaseSteps,
  producer: producerShowcaseSteps,
  fan: fanShowcaseSteps,
};

const badgeMap: Record<JourneyRole, { text: string; title: string; subtitle: string }> = {
  artist: { text: "Artist Journey", title: "From Upload to Release", subtitle: "Follow the path to professional sound in just 5 steps" },
  engineer: { text: "Engineer Journey", title: "From Profile to Profit", subtitle: "Build your audio business with our platform" },
  producer: { text: "Producer Journey", title: "From Beat to Revenue", subtitle: "Turn your production catalog into a passive income engine" },
  fan: { text: "Fan Journey", title: "From Listener to Tastemaker", subtitle: "Shape the sound and earn while you discover" },
};

const HowItWorks = () => {
  const [activeRole, setActiveRole] = useState<JourneyRole>("artist");
  const badge = badgeMap[activeRole];

  return (
    <>
      <SEOHead
        title="How It Works"
        description="See how MixxClub connects artists, engineers, producers, and fans in a living ecosystem. Upload, match, collaborate, and earn — powered by AI."
        keywords="how mixclub works, music production process, ai mixing workflow, professional mastering steps, beat marketplace, fan engagement"
      />
      <JourneyPortal backgroundAsset={journeyPathImage}>
        <Navigation />
        <PathAmbience />

        <main className="relative z-10">
          {/* Gateway section */}
          <JourneyGateway
            activeRole={activeRole}
            onRoleChange={setActiveRole}
          />

          {/* ShowcaseJourney */}
          <ShowcaseJourney
            badge={{
              icon: <Star className="w-4 h-4 text-primary" />,
              text: badge.text,
            }}
            title={badge.title}
            subtitle={badge.subtitle}
            steps={stepsMap[activeRole]}
            variant={activeRole}
          />

          {/* Ecosystem interconnection diagram */}
          <EcosystemFlow />

          {/* Destination CTA */}
          <JourneyDestination role={activeRole} />
        </main>

        <PublicFooter />
      </JourneyPortal>
    </>
  );
};

export default HowItWorks;
