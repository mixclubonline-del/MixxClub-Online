import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Music, Headphones, Users, ArrowRight } from "lucide-react";
import { ParticleBackground } from "@/components/home/2030/ParticleBackground";
import { HoverCard3D } from "@/components/interactive/HoverCard3D";
import { AudioReactiveHero } from "@/components/landing/AudioReactiveHero";
import { FloatingPrimeChat } from "@/components/landing/FloatingPrimeChat";
import { LiveAIMasteringDemo } from "@/components/landing/LiveAIMasteringDemo";
import { EngineerMatchingDemo } from "@/components/landing/EngineerMatchingDemo";
import { RevenueStreamsDemo } from "@/components/landing/RevenueStreamsDemo";
import { Button } from "@/components/ui/button";

// Three main paths
const pathCards = [
  {
    id: 'artist',
    title: 'Create & Collaborate',
    subtitle: 'For Artists',
    description: 'Upload tracks, get AI-powered insights, collaborate with engineers',
    route: '/artist',
    icon: Music,
    gradient: 'from-[hsl(270_100%_70%)] to-[hsl(270_100%_60%)]',
    features: ['AI Mastering', 'Engineer Matching', 'Project Management']
  },
  {
    id: 'engineer',
    title: 'Build & Earn',
    subtitle: 'For Engineers',
    description: 'Accept projects, showcase work, earn from your expertise',
    route: '/engineer',
    icon: Headphones,
    gradient: 'from-[hsl(210_100%_60%)] to-[hsl(210_100%_50%)]',
    features: ['Job Board', 'Portfolio', 'Earnings Dashboard']
  },
  {
    id: 'community',
    title: 'Connect & Compete',
    subtitle: 'For Everyone',
    description: 'Join battles, share work, learn from the community',
    route: '/community',
    icon: Users,
    gradient: 'from-[hsl(185_100%_55%)] to-[hsl(185_100%_45%)]',
    features: ['Mix Battles', 'Live Feed', 'Forums']
  }
];

export default function PrimeLanding() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground overflow-hidden relative">
      {/* Particle Network Background */}
      <ParticleBackground />
      
      {/* Audio-Reactive Hero Section */}
      <AudioReactiveHero />

      {/* Interactive Feature Demos Section */}
      <section className="relative px-6 py-24 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">See It In Action</h2>
            <p className="text-xl text-muted-foreground">Interactive demos - click to experience</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <LiveAIMasteringDemo />
            <EngineerMatchingDemo />
            <RevenueStreamsDemo />
          </div>
        </div>
      </section>

      {/* Three Paths Section */}
      <section className="relative px-6 py-24 bg-[hsl(var(--card)/0.3)] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-xl text-muted-foreground">Three ways to elevate your music</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pathCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={card.route}>
                  <HoverCard3D intensity="high" className="h-full">
                    <div className="group h-full glass-near rounded-2xl p-8 transition-all duration-300 cursor-pointer border border-[hsl(var(--glass-border))] hover:border-[hsl(var(--glass-border-glow))] hover:shadow-glass-glow glass-reflect">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <card.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className={`text-sm font-mono text-transparent bg-clip-text bg-gradient-to-r ${card.gradient} mb-2`}>
                        {card.subtitle}
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                      <p className="text-muted-foreground mb-6">{card.description}</p>
                      <ul className="space-y-2 mb-6">
                        {card.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.gradient}`} />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center gap-2 text-[hsl(var(--primary))] group-hover:gap-4 transition-all">
                        <span className="font-medium">Get Started</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </HoverCard3D>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative px-6 py-24 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Sound?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of artists and engineers creating the future of music
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="group bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))] hover:shadow-[0_0_80px_hsl(var(--primary)/0.8)] transition-all border border-[hsl(var(--primary)/0.3)]">
                <span className="flex items-center gap-2 font-semibold">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Floating Prime Chat Widget */}
      <FloatingPrimeChat />
    </div>
  );
}
