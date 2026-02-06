import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Sparkles, 
  Upload, 
  Zap, 
  DollarSign, 
  Check, 
  Music,
  Brain,
  Target,
  Award
} from 'lucide-react';
import { ServiceRoomView } from '@/components/services/ServiceRoomView';
import { ShowcaseFeature } from '@/components/services/ShowcaseFeature';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Import showcase images
import aiNeuralNetwork from '@/assets/promo/ai-neural-network.jpg';
import aiInstantAnalysis from '@/assets/promo/ai-instant-analysis.jpg';
import aiPlatformOptimize from '@/assets/promo/ai-platform-optimize.jpg';
import aiQualityMetrics from '@/assets/promo/ai-quality-metrics.jpg';
import masteringRoomBg from '@/assets/service-mastering-room.jpg';

const AIMastering = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const showcaseFeatures = [
    {
      image: aiNeuralNetwork,
      icon: Brain,
      title: "Neural Network Processing",
      subtitle: "Deep Learning",
      description: "Our AI has been trained on over 100,000 Grammy-winning masters across every genre. It understands the nuances of professional mastering and applies them to your tracks.",
      stats: [
        { label: "Training Data", value: "100K+" },
        { label: "Genres", value: "50+" },
        { label: "Accuracy", value: "99%" }
      ],
      techDetails: ["Deep Learning", "Neural Networks", "Real-Time Processing", "Adaptive Algorithms"]
    },
    {
      image: aiInstantAnalysis,
      icon: Zap,
      title: "Instant Audio Analysis",
      subtitle: "60 Second Results",
      description: "Upload your track and get instant analysis of genre, BPM, key signature, and audio characteristics. Our AI provides detailed insights in under a minute.",
      stats: [
        { label: "Processing", value: "<60s" },
        { label: "Parameters", value: "200+" },
        { label: "Reports", value: "Detailed" }
      ],
      techDetails: ["Genre Detection", "BPM Analysis", "Key Signature", "Dynamic Range"]
    },
    {
      image: aiPlatformOptimize,
      icon: Target,
      title: "Platform Optimization",
      subtitle: "Streaming Ready",
      description: "Automatically optimized for every major streaming platform. Get separate masters for Spotify, Apple Music, YouTube, and more—each tuned to platform-specific requirements.",
      stats: [
        { label: "Platforms", value: "15+" },
        { label: "Formats", value: "All" },
        { label: "LUFS", value: "Optimized" }
      ],
      techDetails: ["Spotify Ready", "Apple Hi-Res", "YouTube Format", "TikTok Optimized"]
    },
    {
      image: aiQualityMetrics,
      icon: Award,
      title: "Professional Quality Metrics",
      subtitle: "Industry Standards",
      description: "Every master comes with comprehensive quality reports. Dynamic range, loudness, frequency balance—see exactly how your track measures up to professional standards.",
      stats: [
        { label: "Metrics", value: "50+" },
        { label: "Standards", value: "Pro" },
        { label: "Reports", value: "PDF" }
      ],
      techDetails: ["Quality Score", "Frequency Analysis", "Loudness Reports", "Comparison Tools"]
    }
  ];

  const packages = [
    {
      name: 'Single Track',
      price: 9.99,
      features: [
        '1 mastered track',
        'Unlimited revisions',
        'All platform formats',
        'Instant delivery',
      ],
    },
    {
      name: 'EP Package',
      price: 34.99,
      features: [
        'Up to 5 tracks',
        'Consistent sound',
        'Unlimited revisions',
        'All platform formats',
        'Priority processing',
      ],
      popular: true,
    },
    {
      name: 'Album Package',
      price: 79.99,
      features: [
        'Up to 15 tracks',
        'Album flow optimization',
        'Unlimited revisions',
        'All platform formats',
        'Dedicated support',
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>AI Mastering — MixClub Services</title>
        <meta name="description" content="Instant AI-powered mastering trained on 100,000+ professional masters. Get Grammy-quality results in 60 seconds." />
      </Helmet>

      <ServiceRoomView
        backgroundAsset={masteringRoomBg}
        title="AI Processing"
        subtitle="Instant professional mastering powered by cutting-edge neural networks"
        accentColor="from-cyan-500/20 to-purple-500/20"
      >
        {/* How It Works Quick View */}
        <section className="mb-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              <Zap className="w-4 h-4 mr-2" />
              Instant Results
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How AI Mastering Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional mastering in four simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            {[
              { icon: Upload, title: 'Upload', desc: 'Drop your mixed track' },
              { icon: Brain, title: 'AI Analyzes', desc: 'Neural network processing' },
              { icon: Zap, title: 'Instant Master', desc: 'Ready in 60 seconds' },
              { icon: Music, title: 'Download', desc: 'All platform formats' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-elegant transition-shadow bg-black/40 backdrop-blur-md border-white/10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Showcase Features */}
        <section className="mb-20">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Advanced Technology
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              The Power of AI Mastering
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionary neural network technology trained on professional masters
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

        {/* Pricing */}
        <section id="pricing" className="mb-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Simple Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional mastering at a fraction of traditional studio costs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`relative overflow-hidden bg-black/40 backdrop-blur-md border-white/10 ${pkg.popular ? 'border-primary shadow-elegant' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{pkg.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-black text-foreground">${pkg.price}</span>
                      <span className="text-muted-foreground ml-2">USD</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => navigate(user ? '/artist-crm?tab=business' : '/auth?signup=true')}
                      className="w-full"
                      variant={pkg.popular ? 'default' : 'outline'}
                    >
                      {user ? 'Get Started' : 'Sign Up to Master'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mb-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: 'How does AI mastering compare to human mastering?',
                a: 'Our AI has been trained on over 100,000 professionally mastered tracks. It delivers consistent, high-quality results instantly. For specialized needs, you can always work with our human engineers.',
              },
              {
                q: 'What file formats do you accept?',
                a: 'We accept WAV, AIFF, FLAC, and MP3 files. For best results, upload high-quality WAV or AIFF files at 24-bit/44.1kHz or higher.',
              },
              {
                q: 'Can I get revisions?',
                a: 'Absolutely! All packages include unlimited revisions. Just adjust your settings and remaster instantly.',
              },
              {
                q: 'What platforms are the masters optimized for?',
                a: 'We optimize for all major platforms: Spotify, Apple Music, YouTube, SoundCloud, Tidal, and more. You\'ll receive files ready for each platform.',
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-6 bg-black/40 backdrop-blur-md border-white/10">
                  <h3 className="font-bold mb-2 text-foreground">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-20">
          <motion.div
            className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-md border border-white/10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Brain className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Try AI Mastering?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-6">
              Join thousands of artists who trust our AI mastering technology. 
              Get professional results instantly, every time.
            </p>
            <Button
              size="lg"
              onClick={() => navigate(user ? '/artist-crm?tab=business' : '/auth?signup=true')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
            >
              {user ? 'Start Mastering' : 'Sign Up Free'}
            </Button>
          </motion.div>
        </section>
      </ServiceRoomView>
    </>
  );
};

export default AIMastering;
