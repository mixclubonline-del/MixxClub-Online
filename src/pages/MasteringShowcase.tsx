import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Zap, 
  Target,
  Waves,
  Music,
  Award,
  Brain,
  CheckCircle
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { ServiceRoomView } from "@/components/services/ServiceRoomView";
import { GlassFeaturePanel } from "@/components/services/GlassFeaturePanel";
import { MasteringPackages } from "@/components/mastering/MasteringPackages";
import { MasteringChatbot } from "@/components/MasteringChatbot";
import { Badge } from "@/components/ui/badge";
import masteringRoomBg from "@/assets/service-mastering-room.jpg";

const MasteringShowcase = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      toast.success('Payment successful! Welcome to MixClub AI Mastering!');
    }
    const cancelled = searchParams.get('canceled');
    if (cancelled === 'true') {
      toast.info('Payment was cancelled. You can try again anytime.');
    }
  }, [searchParams]);

  const demoSteps = [
    {
      title: "AI Analysis Begins",
      description: "Our neural network analyzes your track's frequency spectrum, dynamics, and stereo field",
      icon: <Brain className="w-6 h-6" />
    },
    {
      title: "Platform Optimization",
      description: "Automatically optimizes for Spotify, Apple Music, YouTube, and other streaming platforms",
      icon: <Target className="w-6 h-6" />
    },
    {
      title: "Professional Processing",
      description: "Applies industry-standard EQ, compression, limiting, and stereo enhancement",
      icon: <Waves className="w-6 h-6" />
    },
    {
      title: "Final Master Ready",
      description: "Your track is now mastered to professional standards and ready for release",
      icon: <Award className="w-6 h-6" />
    }
  ];

  const features = [
    {
      title: "AI Neural Networks",
      description: "Trained on 100,000+ Grammy-winning masters across all genres",
      icon: <Brain className="w-8 h-8" />,
      details: [
        "Deep learning models trained on professional masters",
        "Genre-specific processing algorithms",
        "Real-time spectral analysis and correction"
      ]
    },
    {
      title: "Instant Processing",
      description: "Get professional masters in under 30 seconds, not hours",
      icon: <Zap className="w-8 h-8" />,
      details: [
        "Cloud-based processing power",
        "No queue times or delays",
        "Instant A/B comparisons available"
      ]
    },
    {
      title: "Platform Optimization", 
      description: "Automatically optimized for every major streaming platform",
      icon: <Target className="w-8 h-8" />,
      details: [
        "Spotify (-14 LUFS) optimization",
        "Apple Music Hi-Res ready",
        "YouTube and TikTok compatible"
      ]
    },
    {
      title: "Professional Quality",
      description: "Meet industry standards with every master",
      icon: <Award className="w-8 h-8" />,
      details: [
        "True Peak limiting to -1dBFS",
        "Optimal dynamic range preservation",
        "Professional loudness standards"
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Helmet>
        <title>Mastering Suite — MixClub Services</title>
        <meta name="description" content="AI-powered mastering trained on 100,000+ professional masters. Get Grammy-quality results instantly." />
      </Helmet>

      <ServiceRoomView
        backgroundAsset={masteringRoomBg}
        title="Mastering Suite"
        subtitle="Grammy-quality masters instantly with revolutionary AI technology"
        accentColor="from-purple-500/20 to-pink-500/20"
      >
        {/* Features Grid */}
        <section className="mb-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Mastering
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How Our AI Mastering Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionary technology that delivers professional mastering results instantly
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

        {/* AI Process Demo */}
        <section className="mb-20">
          <motion.div
            className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Waves className="w-5 h-5 text-purple-400" />
              <h3 className="text-2xl font-bold text-foreground">
                AI Mastering Process
              </h3>
            </div>
            <p className="text-muted-foreground mb-8">
              Watch how our AI transforms your audio in real-time
            </p>
            <div className="space-y-4">
              {demoSteps.map((step, index) => (
                <motion.div 
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${
                    activeDemo === index 
                      ? 'bg-purple-500/10 border border-purple-500/20 scale-[1.02]' 
                      : 'bg-white/5'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`p-3 rounded-xl transition-all ${
                    activeDemo === index ? 'bg-purple-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {activeDemo === index && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* AI Assistant */}
        <section className="mb-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Brain className="w-4 h-4 mr-2" />
              Try Our AI Assistant
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Experience AI Mastering Now
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload a track and get instant professional feedback plus a before/after comparison
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <MasteringChatbot />
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
              Choose Your Mastering Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional AI mastering for every artist, from bedroom producers to major labels
            </p>
          </motion.div>

          <MasteringPackages />
        </section>

        {/* CTA */}
        <section className="mb-20">
          <motion.div
            className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Music className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Master Your Music?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Join thousands of artists who trust our AI mastering technology. 
              Get professional results instantly, every time.
            </p>
          </motion.div>
        </section>
      </ServiceRoomView>
    </>
  );
};

export default MasteringShowcase;
