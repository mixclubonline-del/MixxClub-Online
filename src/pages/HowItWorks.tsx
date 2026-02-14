import { useState } from "react";
import { PublicFooter } from "@/components/layouts/PublicFooter";
import { Upload, Sparkles, Users, Headphones, Download, UserPlus, Briefcase, Zap, DollarSign, Star } from "lucide-react";
import Navigation from "@/components/Navigation";
import JourneyPortal from "@/components/journey/JourneyPortal";
import PathAmbience from "@/components/journey/PathAmbience";
import JourneyGateway from "@/components/journey/JourneyGateway";
import JourneyDestination from "@/components/journey/JourneyDestination";
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

const artistShowcaseSteps: ShowcaseStep[] = [
  {
    image: journeyArtistUpload,
    icon: Upload,
    stepNumber: 1,
    title: "Upload Your Track",
    description: "Drag and drop your audio file into our secure cloud. We support all major formats including WAV, MP3, AIFF, and FLAC with lossless quality preservation.",
    stats: [
      { label: "Formats", value: "15+" },
      { label: "Max Size", value: "2GB" },
      { label: "Time", value: "2 min" }
    ],
    techDetails: ["Lossless Upload", "Auto-Organize", "Secure Cloud", "Stem Detection"]
  },
  {
    image: journeyArtistAi,
    icon: Sparkles,
    stepNumber: 2,
    title: "AI Analyzes Your Sound",
    description: "Our AI profiles your track's genre, mood, key, tempo, and technical needs to find the perfect engineer match for your unique sound.",
    stats: [
      { label: "Analysis", value: "Instant" },
      { label: "Accuracy", value: "98%" },
      { label: "Genres", value: "50+" }
    ],
    techDetails: ["Genre Detection", "Mood Analysis", "Key & Tempo", "Reference Matching"]
  },
  {
    image: journeyArtistMatch,
    icon: Users,
    stepNumber: 3,
    title: "Get Matched with Engineers",
    description: "We connect you with verified engineers who specialize in your sound and style. Review portfolios, ratings, and choose your perfect collaborator.",
    stats: [
      { label: "Engineers", value: "500+" },
      { label: "Match Rate", value: "95%" },
      { label: "Response", value: "<1hr" }
    ],
    techDetails: ["AI Matching", "Verified Profiles", "Portfolio Reviews", "Instant Connect"]
  },
  {
    image: journeyArtistCollab,
    icon: Headphones,
    stepNumber: 4,
    title: "Collaborate in Real-Time",
    description: "Work together in our collaborative workspace with live feedback, version control, and unlimited revisions until your track sounds perfect.",
    stats: [
      { label: "Revisions", value: "∞" },
      { label: "Turnaround", value: "1-3 days" },
      { label: "Latency", value: "<50ms" }
    ],
    techDetails: ["Live Sessions", "Version Control", "Reference Tracks", "Chat & Video"]
  },
  {
    image: journeyArtistDownload,
    icon: Download,
    stepNumber: 5,
    title: "Download Your Hit",
    description: "Get your radio-ready master in multiple formats. Share directly to streaming platforms or download high-resolution files for distribution.",
    stats: [
      { label: "Formats", value: "All" },
      { label: "Quality", value: "24-bit" },
      { label: "Delivery", value: "Instant" }
    ],
    techDetails: ["Multi-Format", "Streaming Ready", "Master Files", "Distribution"]
  }
];

const engineerShowcaseSteps: ShowcaseStep[] = [
  {
    image: journeyEngineerProfile,
    icon: UserPlus,
    stepNumber: 1,
    title: "Create Your Profile",
    description: "Showcase your portfolio, certifications, and expertise. Set your rates, availability, and let our AI optimize your profile for discovery.",
    stats: [
      { label: "Setup", value: "15 min" },
      { label: "Portfolio", value: "∞ tracks" },
      { label: "Visibility", value: "Global" }
    ],
    techDetails: ["Portfolio Hosting", "Rate Setting", "Specialty Tags", "AI Optimization"]
  },
  {
    image: journeyEngineerMatch,
    icon: Briefcase,
    stepNumber: 2,
    title: "Get Matched with Artists",
    description: "Browse opportunities or get automatically matched with artists who fit your style. Accept projects that excite you and fit your schedule.",
    stats: [
      { label: "Projects", value: "100+/day" },
      { label: "Match Quality", value: "95%" },
      { label: "Response", value: "Flexible" }
    ],
    techDetails: ["AI Matching", "Project Filters", "Genre Preferences", "Availability Sync"]
  },
  {
    image: journeyEngineerWork,
    icon: Zap,
    stepNumber: 3,
    title: "Work Your Magic",
    description: "Use our professional cloud tools or your own DAW. Artists see progress in real-time, leave comments, and approve revisions seamlessly.",
    stats: [
      { label: "Cloud Tools", value: "Pro Grade" },
      { label: "Plugins", value: "100+" },
      { label: "Storage", value: "∞" }
    ],
    techDetails: ["Cloud DAW", "Plugin Suite", "Version Control", "Client Sync"]
  },
  {
    image: journeyEngineerEarn,
    icon: DollarSign,
    stepNumber: 4,
    title: "Earn 70% Revenue",
    description: "Keep 70% of every project. Get paid instantly when projects complete. Build your reputation with verified reviews and grow your client base.",
    stats: [
      { label: "Revenue", value: "70%" },
      { label: "Payout", value: "Same day" },
      { label: "Reviews", value: "Verified" }
    ],
    techDetails: ["Instant Payouts", "Revenue Dashboard", "Client CRM", "Growth Analytics"]
  }
];

const HowItWorks = () => {
  const [activeRole, setActiveRole] = useState<"artist" | "engineer">("artist");

  return (
    <JourneyPortal backgroundAsset={journeyPathImage}>
      <Navigation />
      <PathAmbience />
      
      <main className="relative z-10">
        {/* Gateway section */}
        <JourneyGateway 
          activeRole={activeRole} 
          onRoleChange={(role) => {
            setActiveRole(role);
          }} 
        />

        {/* ShowcaseJourney - replaces legacy JourneyPath */}
        <ShowcaseJourney
          badge={{ 
            icon: <Star className="w-4 h-4 text-primary" />, 
            text: activeRole === "artist" ? "Artist Journey" : "Engineer Journey" 
          }}
          title={activeRole === "artist" ? "From Upload to Release" : "From Profile to Profit"}
          subtitle={activeRole === "artist" 
            ? "Follow the path to professional sound in just 5 steps"
            : "Build your audio business with our platform"}
          steps={activeRole === "artist" ? artistShowcaseSteps : engineerShowcaseSteps}
          variant={activeRole}
        />

        {/* Destination CTA */}
        <JourneyDestination role={activeRole} />
      </main>

      <PublicFooter />
    </JourneyPortal>
  );
};

export default HowItWorks;
