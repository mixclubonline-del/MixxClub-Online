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
  CheckCircle
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { ServiceRoomView } from "@/components/services/ServiceRoomView";
import { GlassFeaturePanel } from "@/components/services/GlassFeaturePanel";
import { MixingPackages } from "@/components/mixing/MixingPackages";
import { Badge } from "@/components/ui/badge";
import mixingRoomBg from "@/assets/service-mixing-room.jpg";

const MixingShowcase = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      toast.success('Payment successful! Welcome to MixClub Professional Mixing!');
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

  const features = [
    {
      title: "Three-Way Collaboration",
      description: "Artist, Engineer, and AI working together for the perfect mix",
      icon: <Users className="w-8 h-8" />,
      details: [
        "Real-time communication between all parties",
        "Shared workspace with version control",
        "AI provides intelligent suggestions throughout"
      ]
    },
    {
      title: "AI-Powered Insights",
      description: "Machine learning that enhances human creativity",
      icon: <Brain className="w-8 h-8" />,
      details: [
        "Automatic stem separation and analysis",
        "Genre-specific mixing suggestions",
        "Real-time frequency and dynamic analysis"
      ]
    },
    {
      title: "Professional Engineers", 
      description: "Vetted professionals with proven track records",
      icon: <UserCheck className="w-8 h-8" />,
      details: [
        "Industry-certified mixing engineers",
        "Specialized in multiple genres",
        "Portfolio of successful releases"
      ]
    },
    {
      title: "Real-Time Studio",
      description: "Virtual mixing studio with professional tools",
      icon: <Headphones className="w-8 h-8" />,
      details: [
        "Cloud-based mixing console",
        "Professional plugins and effects",
        "Instant preview and sharing"
      ]
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
      <Helmet>
        <title>Mixing Studio — MixClub Services</title>
        <meta name="description" content="Professional collaborative mixing with real engineers and AI-powered insights. Three-way collaboration for the perfect mix." />
      </Helmet>

      <ServiceRoomView
        backgroundAsset={mixingRoomBg}
        title="Mixing Studio"
        subtitle="Where artist vision meets engineering expertise, enhanced by AI intelligence"
        accentColor="from-blue-500/20 to-green-500/20"
      >
        {/* Features Grid */}
        <section className="mb-20">
          <motion.div
            className="text-center mb-12"
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <GlassFeaturePanel
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                details={feature.details}
                delay={index * 0.1}
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
