import { useState } from "react";
import { Upload, Sparkles, Users, Headphones, Zap, Download, UserPlus, Briefcase, DollarSign } from "lucide-react";
import Navigation from "@/components/Navigation";
import JourneyPortal from "@/components/journey/JourneyPortal";
import PathAmbience from "@/components/journey/PathAmbience";
import JourneyGateway from "@/components/journey/JourneyGateway";
import JourneyPath from "@/components/journey/JourneyPath";
import JourneyDestination from "@/components/journey/JourneyDestination";
import journeyPathImage from "@/assets/journey-path.jpg";
import { AudioLens } from "@/components/showcase/AudioLens";
import { CityScrollContainer } from "@/components/showcase/CityScrollContainer";
import { PrimeSimSession } from "@/components/showcase/PrimeSimSession";
import { motion } from "framer-motion";

const artistSteps = [
  {
    icon: Upload,
    title: "Upload Your Track",
    description: "Drag and drop your audio file. We support all major formats (WAV, MP3, AIFF, FLAC).",
    time: "2 minutes",
  },
  {
    icon: Sparkles,
    title: "AI Analyzes Your Sound",
    description: "Our AI profiles your track's genre, mood, and technical needs to find the perfect match.",
    time: "Instant",
  },
  {
    icon: Users,
    title: "Get Matched with Engineers",
    description: "We connect you with engineers who specialize in your sound and style.",
    time: "Instant",
  },
  {
    icon: Headphones,
    title: "Collaborate in Real-Time",
    description: "Work together in our collaborative workspace with live feedback and revisions.",
    time: "1-3 days",
  },
  {
    icon: Download,
    title: "Download Your Hit",
    description: "Get your radio-ready master and start sharing your music with the world.",
    time: "Done!",
  },
];

const engineerSteps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Showcase your portfolio, set your rates, and highlight your specialties.",
    time: "15 minutes",
  },
  {
    icon: Briefcase,
    title: "Get Matched with Artists",
    description: "Browse opportunities or get matched with artists who fit your style.",
    time: "Ongoing",
  },
  {
    icon: Zap,
    title: "Work Your Magic",
    description: "Use our professional tools to deliver exceptional mixes and masters.",
    time: "Flexible",
  },
  {
    icon: DollarSign,
    title: "Earn 70% Revenue",
    description: "Keep 70% of your earnings. Build your reputation with verified reviews.",
    time: "Same day",
  },
];

const HowItWorks = () => {
  const [activeRole, setActiveRole] = useState<"artist" | "engineer">("artist");
  const [activeStep, setActiveStep] = useState(0);

  const steps = activeRole === "artist" ? artistSteps : engineerSteps;

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
            setActiveStep(0);
          }} 
        />

        {/* Interactive Demo Section - The Sonic Lens */}
        <section className="relative z-20 py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Hear the <span className="text-primary">Difference</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Don't just take our word for it. Interactions speak louder than text.
              </p>
            </motion.div>

            <AudioLens 
              audioSrc="https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3" 
              className="max-w-4xl mx-auto shadow-2xl shadow-primary/10"
            />
          </div>
        </section>

        {/* Immersive City Flyover */}
        <CityScrollContainer />

        {/* Prime's Live Session */}
        <section className="relative z-20 py-24 bg-gradient-to-b from-black to-background">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-primary">Prime</span> is Your Co-Pilot
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Watch our AI assistant build a session from a single prompt.
              </p>
            </motion.div>

            <PrimeSimSession />
          </div>
        </section>

        {/* Journey path - Legacy View (Optional or Below) */}
        <section className="relative z-10 py-20 bg-background/50 backdrop-blur-md">
          <div className="container mx-auto px-6 text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Step-by-Step Guide</h3>
            <p className="text-muted-foreground">For those who prefer a traditional view.</p>
          </div>
          <JourneyPath 
            steps={steps} 
            activeStep={activeStep}
            onStepClick={setActiveStep}
            variant={activeRole}
          />
        </section>

        {/* Destination CTA */}
        <JourneyDestination role={activeRole} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8 bg-background/50 backdrop-blur-sm">
        <div className="container px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 MixClub. Make your music sound as good as the pros.</p>
        </div>
      </footer>
    </JourneyPortal>
  );
};

export default HowItWorks;
