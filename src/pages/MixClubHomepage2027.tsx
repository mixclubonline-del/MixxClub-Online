import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, Sliders, Zap, Trophy, Music, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlobalHeader from '@/components/GlobalHeader';
import StorySection from '@/components/mixclub/StorySection';
import EcosystemVisualization from '@/components/mixclub/EcosystemVisualization';
import AIDemo from '@/components/mixclub/AIDemo';

export default function MixClubHomepage2027() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>MIXXCLUB — The Future of Sound Collaboration</title>
        <meta 
          name="description" 
          content="Where artists, engineers, and AI create together in real time. Transform your sound from bedroom to billboard with MIXXCLUB's revolutionary platform." 
        />
        <meta name="keywords" content="MIXXCLUB, AI mixing, music mastering, sound collaboration, artist platform, engineer network" />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a] text-foreground overflow-x-hidden">
        <GlobalHeader />

        {/* SECTION 1: Cinematic Entry */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(280_80%_15%)_0%,hsl(235_60%_8%)_100%)]" />
          
          {/* Animated Particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-4 max-w-6xl mx-auto pt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.h1 
                className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-wider"
                style={{
                  textShadow: '0 0 80px rgba(6, 182, 212, 0.5)',
                }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                  MIXXCLUB
                </span>
              </motion.h1>

              <motion.p 
                className="text-2xl md:text-4xl font-light mb-4 text-foreground/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                The Future of Sound Collaboration
              </motion.p>

              <motion.p 
                className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                Where Artists, Engineers, and AI create together in real time.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <Button
                  size="lg"
                  onClick={() => scrollToSection('ecosystem')}
                  className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                >
                  Experience the Studio
                  <ArrowRight className="ml-2" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection('ai-demo')}
                  className="text-lg px-8 py-6 border-cyan-400/50 hover:bg-cyan-400/10"
                >
                  Try AI Mixing & Mastering
                </Button>
              </motion.div>
            </motion.div>

            {/* Animated Waveform */}
            <motion.div
              className="mt-20 flex items-center justify-center gap-1 h-32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-purple-500 to-cyan-400 rounded-full"
                  animate={{
                    height: [
                      `${20 + Math.random() * 30}%`,
                      `${40 + Math.random() * 50}%`,
                      `${20 + Math.random() * 30}%`,
                    ],
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex justify-center pt-2">
              <motion.div
                className="w-1 h-2 bg-cyan-400 rounded-full"
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* SECTION 2: The Story */}
        <StorySection />

        {/* SECTION 3: Ecosystem Visualization */}
        <section id="ecosystem" className="py-24 px-4 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              The MIXXCLUB Ecosystem
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A living, breathing network where every element works together to elevate your sound.
            </p>
          </motion.div>

          <EcosystemVisualization />
        </section>

        {/* SECTION 4: How It Works */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400"
            >
              How It Works
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Artist Studio */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all" />
                <div className="relative p-8 rounded-2xl backdrop-blur-xl border border-purple-500/30 bg-card/50 h-full">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
                    <Headphones size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">Artist Studio</h3>
                  <p className="text-muted-foreground mb-6">
                    Upload your raw vocals. Our AI instantly analyzes your mix and gives you a preview of your potential final sound.
                  </p>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Upload from any device</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>AI Mix & Master Preview</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Vocal Analyzer (frequency + clarity map)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Milestone Tracker (progress + feedback)</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Try the AI Studio →
                  </Button>
                </div>
              </motion.div>

              {/* Engineer Studio */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full group-hover:bg-cyan-500/20 transition-all" />
                <div className="relative p-8 rounded-2xl backdrop-blur-xl border border-cyan-500/30 bg-card/50 h-full">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6">
                    <Sliders size={32} className="text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-cyan-400">Engineer Studio</h3>
                  <p className="text-muted-foreground mb-6">
                    For professional engineers who want to earn, collaborate, and stand out.
                  </p>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>Receive AI-enhanced mix data for faster workflow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>Integrated plugins and parameter linking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>Payment + ranking system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>Access to battles, community ratings, and unlockables</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Join as an Engineer →
                  </Button>
                </div>
              </motion.div>

              {/* Collaboration Layer */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 blur-3xl rounded-full group-hover:from-purple-500/20 group-hover:to-cyan-500/20 transition-all" />
                <div className="relative p-8 rounded-2xl backdrop-blur-xl border border-gradient-to-br from-purple-500/30 to-cyan-500/30 bg-card/50 h-full">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                    <Zap size={32} className="text-pink-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
                    Collaboration Layer
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Artists and engineers meet in real time. Chat, revise, share stems, and use the same AI tools for clarity and speed.
                  </p>
                  <div className="mb-6 p-4 rounded-xl bg-background/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-muted-foreground">Real-time collaboration</span>
                    </div>
                    <div className="h-16 flex items-center justify-center gap-4">
                      <motion.div
                        className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-16 h-1 bg-gradient-to-r from-purple-500 to-cyan-500"
                        animate={{ scaleX: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      />
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                    See It In Action →
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 5: AI Demo */}
        <div id="ai-demo">
          <AIDemo />
        </div>

        {/* SECTION 6: Community & Culture */}
        <section className="py-24 px-4 bg-gradient-to-b from-transparent via-pink-950/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                More Than a Studio — It's a Movement
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join a living community of creators, compete in battles, unlock exclusive tools, and shape the future of music.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Trophy, title: 'Mix Battles', desc: 'Compete with engineers worldwide. Leaderboards, ratings, and recognition.' },
                { icon: Music, title: 'Listening Parties', desc: 'Experience new releases together. Vote, discuss, and discover.' },
                { icon: Zap, title: 'Unlockable Plugins', desc: 'Earn XP to unlock exclusive AI-powered mixing tools.' },
                { icon: ShoppingBag, title: 'Merch Store', desc: 'Rep your favorite engineers and artists with exclusive gear.' },
                { icon: Zap, title: 'PrimeBot Network', desc: 'Our AI learns from every project, getting smarter with your input.' },
                { icon: Headphones, title: 'Creator Collective', desc: 'Connect with like-minded artists and engineers in your genre.' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl backdrop-blur-xl border border-primary/20 bg-card/50 hover:border-primary/40 transition-all"
                  >
                    <Icon size={32} className="text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="text-center mt-16"
            >
              <blockquote className="text-2xl md:text-3xl italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                "It's more than a studio — it's a movement."
              </blockquote>
              <p className="text-muted-foreground mt-4">— Prime</p>
            </motion.div>
          </div>
        </section>


        {/* SECTION 8: Final CTA */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(280_80%_15%)_0%,hsl(235_60%_8%)_100%)]" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative z-10 text-center px-4"
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Join MIXXCLUB
            </h2>
            <p className="text-2xl md:text-3xl text-foreground/80 mb-12">
              Transform your sound. Unlock your potential.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                asChild
                className="text-xl px-12 py-8 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              >
                <Link to="/artist">Try the AI Mixer</Link>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-xl px-12 py-8 border-cyan-400/50 hover:bg-cyan-400/10"
              >
                <Link to="/hub">Enter the Hub</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}
