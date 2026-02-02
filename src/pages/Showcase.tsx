import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { 
  Music2, Mic2, Sliders, Users, Zap, Sparkles, 
  Radio, Headphones, BarChart3, AudioWaveform, Bot, Crown,
  Play, ArrowRight, ChevronDown, Globe, DollarSign, TrendingUp
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

// Import ULTRA-SPECIFIC technology images
import lufsMetering from '@/assets/promo/lufs-metering-daw.jpg';
import parametricEQ from '@/assets/promo/parametric-eq-analyzer.jpg';
import webrtcCollab from '@/assets/promo/webrtc-collaboration.jpg';
import aiAnalysis from '@/assets/promo/ai-track-analysis.jpg';
import beforeAfter from '@/assets/promo/before-after-master.jpg';

const techFeatures = [
  {
    icon: BarChart3,
    title: 'LUFS Metering & Loudness',
    subtitle: 'Streaming-Ready Masters',
    description: 'Real-time integrated loudness monitoring with short-term, momentary, and true peak metering. Hit -14 LUFS for Spotify, -16 for Apple Music. Professional broadcast-standard loudness analysis.',
    image: lufsMetering,
    stats: [
      { label: 'LUFS Range', value: '-24 to -8' },
      { label: 'True Peak', value: '-1dB' },
      { label: 'Sample Rate', value: '192kHz' }
    ],
    techDetails: ['EBU R128 Compliant', 'ITU-R BS.1770-4', 'Loudness Range (LRA)'],
  },
  {
    icon: AudioWaveform,
    title: '6-Band Parametric EQ',
    subtitle: 'AI-Powered Frequency Sculpting',
    description: 'Real-time FFT spectrum analyzer with draggable frequency nodes. AI analyzes your mix and suggests EQ moves: "Reduce 250Hz by 3dB for clarity." See the frequency response curve update live.',
    image: parametricEQ,
    stats: [
      { label: 'Bands', value: '6' },
      { label: 'FFT Size', value: '4096' },
      { label: 'Response', value: 'Real-time' }
    ],
    techDetails: ['80Hz • 250Hz • 1kHz • 3kHz • 8kHz • 16kHz', 'Q: 0.1 to 18', 'Gain: ±24dB'],
  },
  {
    icon: Users,
    title: 'WebRTC Collaboration',
    subtitle: 'Real-Time Remote Sessions',
    description: 'Artist in Detroit, engineer in Lagos. HD video chat, synchronized playback, shared cursor on timeline. Per-participant level metering shows who is talking. Connection recovery with exponential backoff.',
    image: webrtcCollab,
    stats: [
      { label: 'Latency', value: '<50ms' },
      { label: 'Participants', value: '8 max' },
      { label: 'Video', value: '1080p' }
    ],
    techDetails: ['Screen Sharing', 'Audio Mixer per User', 'Session State Persistence'],
  },
  {
    icon: Bot,
    title: 'AI Track Analysis',
    subtitle: 'PrimeBot 4.0 Intelligence',
    description: 'Upload any track. AI detects BPM: 92, Key: C minor, Genre: Hip-Hop/Trap (94% confidence), Energy: 8.5/10. Get specific mixing suggestions: "Boost 808 at 40Hz" and "Add high shelf at 10kHz."',
    image: aiAnalysis,
    stats: [
      { label: 'Accuracy', value: '94%' },
      { label: 'Analysis', value: '<3 sec' },
      { label: 'Genres', value: '50+' }
    ],
    techDetails: ['BPM Detection', 'Key Signature', 'Stem Separation', 'Genre Classification'],
  },
  {
    icon: Sparkles,
    title: 'Before → After Mastering',
    subtitle: 'See The Transformation',
    description: 'Watch your raw bedroom recording transform into a streaming-ready master. Visual waveform comparison shows dynamics processing: from -24 LUFS amateur to -14 LUFS professional. Hear the difference.',
    image: beforeAfter,
    stats: [
      { label: 'Before', value: '-24 LUFS' },
      { label: 'After', value: '-14 LUFS' },
      { label: 'Dynamic', value: '8dB LRA' }
    ],
    techDetails: ['Multi-band Compression', 'Stereo Widening', 'Harmonic Enhancement'],
  },
];

const revenueStreams = [
  { icon: Crown, title: 'Premium Plans', amount: '$29-199/mo', description: 'Unlimited access to studio tools' },
  { icon: Users, title: 'Referral Rewards', amount: '$50-500', description: 'Per artist or engineer you bring' },
  { icon: Radio, title: 'Track Sales', amount: '85% Royalty', description: 'Keep the majority of your sales' },
  { icon: Mic2, title: 'Mixing Gigs', amount: '$50-500/track', description: 'Set your own rates' },
  { icon: Headphones, title: 'Studio Sessions', amount: '$75-200/hr', description: 'Real-time collaboration' },
  { icon: Sparkles, title: 'AI Services', amount: 'Pay per use', description: 'Mastering, analysis, generation' },
];

const globalStats = [
  { label: 'Artists', value: '12K+', icon: Music2 },
  { label: 'Engineers', value: '3.2K+', icon: Sliders },
  { label: 'Countries', value: '89', icon: Globe },
  { label: 'Tracks Mixed', value: '147K+', icon: AudioWaveform },
];

export default function Showcase() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const [activeDemo, setActiveDemo] = useState<number | null>(null);

  return (
    <>
      <Helmet>
        <title>MixClub Technology — Professional DAW, AI Plugins, Real-Time Collaboration</title>
        <meta name="description" content="Explore MixClub's revolutionary technology: LUFS metering, 6-band parametric EQ with AI suggestions, WebRTC collaboration, BPM/key detection, and AI mastering. From bedroom to billboard." />
        <meta name="keywords" content="browser DAW, LUFS metering, parametric EQ, AI mastering, WebRTC music collaboration, BPM detection, hip-hop production" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Navigation />

        {/* REVOLUTIONARY HERO - Full-screen Before/After */}
        <motion.section 
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Background: Before/After transformation */}
          <div className="absolute inset-0">
            <img 
              src={beforeAfter} 
              alt="Before and after audio mastering transformation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Problem Statement */}
              <div className="space-y-4">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg md:text-xl text-muted-foreground"
                >
                  Every day, thousands of tracks die on hard drives...
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-lg md:text-xl text-muted-foreground"
                >
                  Artists can't afford professional mixing. Engineers can't find clients.
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-2xl md:text-3xl font-bold text-primary"
                >
                  Until now.
                </motion.p>
              </div>

              {/* Main Headline */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2, duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-8xl font-black mb-4">
                  <span className="bg-gradient-to-r from-primary via-accent-pink to-accent-blue bg-clip-text text-transparent">
                    THE TECHNOLOGY
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/90 font-medium">
                  That Powers The Revolution
                </p>
              </motion.div>

              {/* Stats Row */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5 }}
                className="flex flex-wrap justify-center gap-8 pt-8"
              >
                {globalStats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                className="flex gap-4 justify-center pt-8"
              >
                <Button size="lg" className="text-lg px-8" onClick={() => navigate('/launch')}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Creating
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate('/insider-demo')}>
                  Watch Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ChevronDown className="w-8 h-8 text-primary" />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* TECHNOLOGY DEEP DIVES */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <Badge variant="outline" className="mb-4 text-primary border-primary">
                PROPRIETARY TECHNOLOGY
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Not Generic. <span className="text-primary">Revolutionary.</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Every tool built specifically for hip-hop production. 
                WebGL waveform rendering. LUFS metering. Real-time AI analysis.
                This technology exists nowhere else.
              </p>
            </motion.div>

            {/* Feature Deep Dives */}
            <div className="space-y-32">
              {techFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
                >
                  {/* Image Side */}
                  <div className="flex-1 relative group">
                    <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-2xl shadow-primary/10">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Overlay with stats */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Stats overlay on hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex gap-4 flex-wrap">
                          {feature.stats.map((stat) => (
                            <div 
                              key={stat.label}
                              className="px-4 py-2 bg-background/95 backdrop-blur rounded-lg border border-border"
                            >
                              <div className="text-xs text-muted-foreground">{stat.label}</div>
                              <div className="text-lg font-bold text-primary">{stat.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating tech badges */}
                    <div className="absolute -bottom-4 -right-4 flex flex-wrap gap-2 max-w-xs">
                      {feature.techDetails.slice(0, 2).map((detail) => (
                        <Badge 
                          key={detail} 
                          className="bg-primary/20 text-primary border-primary/30 text-xs"
                        >
                          {detail}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{feature.subtitle}</Badge>
                    </div>
                    
                    <h3 className="text-3xl md:text-4xl font-bold">{feature.title}</h3>
                    
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Tech specs grid */}
                    <div className="grid grid-cols-3 gap-4 py-4">
                      {feature.stats.map((stat) => (
                        <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                          <div className="text-2xl font-bold text-primary">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Tech details */}
                    <div className="flex flex-wrap gap-2">
                      {feature.techDetails.map((detail) => (
                        <Badge key={detail} variant="outline" className="text-xs">
                          {detail}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* THE ECONOMIC REVOLUTION */}
        <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge variant="outline" className="mb-4 text-accent-pink border-accent-pink">
                THE ECONOMIC REVOLUTION
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                6 Ways to <span className="text-accent-pink">Get Paid</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Not just a platform. A complete revenue ecosystem for music creators.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {revenueStreams.map((stream, index) => (
                <motion.div
                  key={stream.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full bg-card/50 backdrop-blur border-border/50 hover:border-accent-pink/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent-pink/10 group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-accent-pink/10 group-hover:bg-accent-pink/20 transition-colors">
                          <stream.icon className="w-6 h-6 text-accent-pink" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent-pink">{stream.amount}</div>
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold mb-2">{stream.title}</h4>
                      <p className="text-sm text-muted-foreground">{stream.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Total potential */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-accent-pink/20 via-primary/20 to-accent-blue/20 border border-accent-pink/30 text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-accent-pink" />
                <h3 className="text-2xl font-bold">First Month Potential</h3>
              </div>
              <div className="text-5xl font-black text-accent-pink mb-2">$847 - $2,500+</div>
              <p className="text-muted-foreground">Based on average engineer activity with 3-5 mixing sessions</p>
            </motion.div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={aiAnalysis} 
              alt="AI-powered music production"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-background/90 to-accent-blue/30" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 container mx-auto px-4 text-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              From Bedroom to Billboard
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The technology is ready. The community is waiting. 
              Your music career starts in 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-10 py-6" onClick={() => navigate('/for-artists')}>
                I'm an Artist
                <Music2 className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-6" onClick={() => navigate('/for-engineers')}>
                I'm an Engineer
                <Sliders className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
