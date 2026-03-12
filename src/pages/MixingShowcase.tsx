import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Users, 
  Sliders,
  Music,
  Brain,
  UserCheck,
  MessageSquare,
  Share2,
  Headphones,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { ServiceRoomView } from "@/components/services/ServiceRoomView";
import { ShowcaseFeature } from "@/components/services/ShowcaseFeature";
import { MixingPackages } from "@/components/mixing/MixingPackages";
import { Badge } from "@/components/ui/badge";
import mixingRoomBg from "@/assets/service-mixing-room.jpg";

// Import showcase images
import mixingConsole from "@/assets/promo/mixing-console-close.jpg";
import mixingCollab from "@/assets/promo/mixing-collaboration.jpg";
import mixingStemSeparation from "@/assets/promo/mixing-stem-separation.jpg";
import mixingRealtimeFeedback from "@/assets/promo/mixing-realtime-feedback.jpg";

const MixingShowcase = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      toast.success('Payment successful! Welcome to Mixxclub Professional Mixing!');
    }
    const cancelled = searchParams.get('canceled');
    if (cancelled === 'true') {
      toast.info('Payment was cancelled. You can try again anytime.');
    }
  }, [searchParams]);

  const collaborationSteps = [
    {
      title: "Artist Uploads",
      description: "Artist uploads stems and shares vision with mixing engineer",
      icon: <Music className="w-6 h-6" />,
      role: "Artist",
      color: "bg-blue-500"
    },
    {
      title: "AI Analysis",
      description: "AI analyzes tracks and suggests optimal mixing approach",
      icon: <Brain className="w-6 h-6" />,
      role: "AI",
      color: "bg-purple-500"
    },
    {
      title: "Engineer Mixes",
      description: "Professional engineer creates the mix using AI insights",
      icon: <Sliders className="w-6 h-6" />,
      role: "Engineer",
      color: "bg-green-500"
    },
    {
      title: "Real-time Feedback",
      description: "Artist and engineer collaborate with instant communication",
      icon: <MessageSquare className="w-6 h-6" />,
      role: "Collaboration",
      color: "bg-orange-500"
    }
  ];

  const showcaseFeatures = [
    {
      image: mixingConsole,
      icon: Sliders,
      title: "Professional Console",
      subtitle: "Analog Warmth",
      description: "Access the same mixing tools used in world-class studios. Our cloud-based console emulates legendary hardware with SSL, Neve, and API processing at your fingertips.",
      stats: [
        { label: "Channels", value: "64" },
        { label: "Plugins", value: "200+" },
        { label: "Sample Rate", value: "96kHz" }
      ],
      techDetails: ["SSL Emulation", "Neve EQ", "API Compression", "UAD Integration"]
    },
    {
      image: mixingCollab,
      icon: Users,
      title: "Three-Way Collaboration",
      subtitle: "Real-Time Sessions",
      description: "Artist, engineer, and AI working together in perfect harmony. Watch your mix evolve in real-time with video chat, instant feedback, and shared control.",
      stats: [
        { label: "Latency", value: "<50ms" },
        { label: "Resolution", value: "4K" },
        { label: "Participants", value: "∞" }
      ],
      techDetails: ["Video Chat", "Screen Share", "Real-Time Sync", "Version Control"]
    },
    {
      image: mixingStemSeparation,
      icon: Brain,
      title: "AI-Powered Stem Separation",
      subtitle: "Intelligent Analysis",
      description: "Our neural network automatically separates and analyzes your stems, providing genre-specific insights and optimization suggestions for the perfect mix.",
      stats: [
        { label: "Accuracy", value: "99.2%" },
        { label: "Stems", value: "8+" },
        { label: "Genres", value: "50+" }
      ],
      techDetails: ["Neural Processing", "Genre Detection", "BPM Analysis", "Key Detection"]
    },
    {
      image: mixingRealtimeFeedback,
      icon: MessageSquare,
      title: "Real-Time Feedback",
      subtitle: "Instant Communication",
      description: "Drop comments directly on the timeline, mark sections for revision, and communicate seamlessly with your engineer throughout the entire mixing process.",
      stats: [
        { label: "Response", value: "Instant" },
        { label: "Revisions", value: "Unlimited" },
        { label: "History", value: "Full" }
      ],
      techDetails: ["Timeline Comments", "Revision Marks", "Chat Integration", "Notification System"]
    }
  ];

  const processFlow = [
    { step: 1, title: "Project Setup", description: "Artist creates project and uploads stems", icon: <Music className="w-5 h-5" /> },
    { step: 2, title: "Engineer Matching", description: "AI matches you with the perfect engineer", icon: <UserCheck className="w-5 h-5" /> },
    { step: 3, title: "AI Analysis", description: "Tracks are analyzed for optimal mixing approach", icon: <Brain className="w-5 h-5" /> },
    { step: 4, title: "Collaborative Mixing", description: "Real-time mixing with feedback and revisions", icon: <Sliders className="w-5 h-5" /> },
    { step: 5, title: "Final Delivery", description: "Professional mix delivered in all formats", icon: <Share2 className="w-5 h-5" /> }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % collaborationSteps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <SEOHead
        title="Professional Mixing Studio"
        description="Professional collaborative mixing with real engineers and AI-powered insights. Three-way artist-AI-engineer collaboration for the perfect mix."
        keywords="mixing service, professional mixing, AI mixing, audio engineer, stem mixing, music production"
      </Helmet>

      <ServiceRoomView
        backgroundAsset={mixingRoomBg}
        title="Mixing Studio"
        subtitle="Where artist vision meets engineering expertise, enhanced by AI intelligence"
        accentColor="from-blue-500/20 to-green-500/20"
      >
        {/* Showcase Features */}
        <section className="mb-20">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Users className="w-4 h-4 mr-2" />
              Collaborative Mixing
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How Our Unique Process Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionary three-way collaboration between artist vision, engineering expertise, and AI intelligence
            </p>
          </motion.div>

          <div className="space-y-24 lg:space-y-32">
            {showcaseFeatures.map((feature, index) => (
              <ShowcaseFeature
                key={feature.title}
                {...feature}
                reversed={index % 2 !== 0}
              />
            ))}
          </div>
        </section>

        {/* Workflow Demo */}
        <section className="mb-20">
          <motion.div
            className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
              Collaborative Workflow
            </h3>
            <div className="space-y-4">
              {collaborationSteps.map((step, index) => (
                <motion.div 
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${
                    activeDemo === index 
                      ? 'bg-white/10 border border-white/20 scale-[1.02]' 
                      : 'bg-white/5'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`p-3 rounded-xl text-white transition-all ${
                    activeDemo === index ? step.color : 'bg-muted'
                  }`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{step.title}</h4>
                      <Badge variant="outline" className="text-xs border-white/20">
                        {step.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {activeDemo === index && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Process Flow */}
        <section className="mb-20">
          <motion.div
            className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-center mb-2 text-foreground">
              Step-by-Step Process
            </h3>
            <p className="text-center text-muted-foreground mb-8">
              From upload to professional mix delivery
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {processFlow.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="text-center group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">Step {item.step}</div>
                  <div className="text-xs font-semibold text-accent mb-2">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Packages Section */}
        <section id="packages" className="mb-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Choose Your Mixing Package
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional mixing for every level, from bedroom producers to major labels
            </p>
          </motion.div>

          <MixingPackages />
        </section>
      </ServiceRoomView>
    </>
  );
};

export default MixingShowcase;
