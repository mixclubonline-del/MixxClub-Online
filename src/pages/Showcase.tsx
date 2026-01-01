import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Music2, Mic2, Sliders, Users, Zap, Sparkles, 
  Radio, Headphones, BarChart3, AudioWaveform, Bot, Crown 
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

// Import generated promo images
import studioConsoleHero from '@/assets/promo/studio-console-hero.jpg';
import pluginShowcaseHero from '@/assets/promo/plugin-showcase-hero.jpg';
import collaborationHero from '@/assets/promo/collaboration-hero.jpg';
import primebotAvatar from '@/assets/promo/primebot-avatar.jpg';
import dawInterfaceHero from '@/assets/promo/daw-interface-hero.jpg';

const features = [
  {
    icon: Sliders,
    title: 'Hybrid DAW',
    description: '6-layer cloud studio with real-time waveform rendering, track freezing, VCA groups, and bus routing.',
    image: dawInterfaceHero,
    stats: ['44.1kHz-192kHz', '32-bit float', '<10ms latency'],
    link: '/hybrid-daw',
  },
  {
    icon: AudioWaveform,
    title: 'Plugin Suite',
    description: '24 professional plugins including MixxMaster, MixxEQ, MixxComp, vintage emulations, and AI-powered tools.',
    image: pluginShowcaseHero,
    stats: ['24 plugins', 'VST3 quality', 'Zero latency'],
    link: '/services/mixing',
  },
  {
    icon: Users,
    title: 'Real-Time Collaboration',
    description: 'WebRTC video chat, screen sharing, synchronized playback, and per-participant level metering.',
    image: collaborationHero,
    stats: ['8 participants', 'HD video', 'Low latency'],
    link: '/community',
  },
  {
    icon: Bot,
    title: 'PrimeBot 4.0',
    description: 'AI Lead Engineer with deep hip-hop production knowledge, real-time mixing suggestions, and DAW integration.',
    image: primebotAvatar,
    stats: ['GPT-5 powered', '24/7 available', 'Genre expert'],
    link: '/brand-forge',
  },
  {
    icon: BarChart3,
    title: 'Audio Analysis',
    description: 'BPM detection, genre classification, key signature analysis, stem separation, and frequency visualization.',
    image: studioConsoleHero,
    stats: ['AI analysis', 'Real-time', '99% accuracy'],
    link: '/services/ai-mastering',
  },
];

const revenueStreams = [
  { icon: Crown, title: 'Premium Subscriptions', description: 'Monthly plans with unlimited access' },
  { icon: Users, title: 'Referral Rewards', description: 'Earn from every sign-up you bring' },
  { icon: Radio, title: 'Track Sales', description: 'Sell your mixed tracks directly' },
  { icon: Mic2, title: 'Gig Marketplace', description: 'Find and post mixing jobs' },
  { icon: Headphones, title: 'Studio Sessions', description: 'Book time with pro engineers' },
  { icon: Sparkles, title: 'AI Services', description: 'Automated mastering & analysis' },
];

export default function Showcase() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Showcase — MixClub Tech</title>
        <meta name="description" content="Explore MixClub's professional music production tools: Hybrid DAW, AI plugins, real-time collaboration, and more." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navigation />

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${studioConsoleHero})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
                THE FUTURE OF MUSIC PRODUCTION
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent-pink to-accent-blue bg-clip-text text-transparent">
                MixClub Tech
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Professional-grade tools for artists and engineers. From bedroom to billboard.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/launch')}>
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/services')}>
                  View Services
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Studio-Grade Tools</h2>
            <p className="text-muted-foreground text-lg">Everything you need to create professional music</p>
          </motion.div>

          <div className="space-y-24">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
              >
                {/* Image */}
                <div className="flex-1 relative group">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                  
                  {/* Stats overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    {feature.stats.map((stat) => (
                      <span 
                        key={stat}
                        className="px-3 py-1 bg-background/90 backdrop-blur rounded-full text-xs font-medium text-primary"
                      >
                        {stat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <feature.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary">Featured Module</span>
                  </div>
                  
                  <h3 className="text-3xl font-bold">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground">{feature.description}</p>
                  
                  <Button onClick={() => navigate(feature.link)} className="group">
                    Explore {feature.title}
                    <Zap className="ml-2 w-4 h-4 group-hover:animate-pulse" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Revenue Streams */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">10 Revenue Streams</h2>
              <p className="text-muted-foreground text-lg">Multiple ways to monetize your talent</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {revenueStreams.map((stream, index) => (
                <motion.div
                  key={stream.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <stream.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{stream.title}</h4>
                        <p className="text-sm text-muted-foreground">{stream.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${collaborationHero})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent-pink/10 to-accent-blue/20" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 container mx-auto px-4 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Level Up?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of artists and engineers already using MixClub.
            </p>
            <Button size="lg" className="text-lg px-8" onClick={() => navigate('/launch')}>
              Start Your Journey
            </Button>
          </motion.div>
        </section>
      </div>
    </>
  );
}
