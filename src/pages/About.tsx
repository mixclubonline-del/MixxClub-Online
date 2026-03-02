import { motion } from 'framer-motion';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import Navigation from '@/components/Navigation';
import { Award, Users, Headphones, Zap } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { organizationSchema } from '@/lib/seo-schema';
import { GlassPanel } from '@/components/crm/design/GlassPanel';
import heroAbout from '@/assets/hero-about.jpg';

const sectionAnim = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stats = [
  { icon: Users, value: '10,000+', label: 'Active Artists', accent: 'rgba(168,85,247,0.35)' },
  { icon: Headphones, value: '500+', label: 'Professional Engineers', accent: 'rgba(6,182,212,0.35)' },
  { icon: Award, value: '50,000+', label: 'Projects Completed', accent: 'rgba(249,115,22,0.35)' },
  { icon: Zap, value: '24/7', label: 'Platform Availability', accent: 'rgba(34,197,94,0.35)' },
];

export default function About() {
  return (
    <>
      <SEOHead
        title="About Us - Professional Audio Engineering Platform"
        description="Learn about Mixxclub's mission to democratize professional audio production. We connect 10,000+ artists with 500+ professional engineers worldwide. 50,000+ projects completed."
        keywords="about mixxclub, audio engineering company, music production platform, professional mixing team"
        schema={organizationSchema}
      />

      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[420px] flex items-center justify-center overflow-hidden">
          <img
            src={heroAbout}
            alt="Diverse hip-hop artists collaborating in a professional studio"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
          {/* Ambient glow orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

          <motion.div
            className="relative z-10 text-center px-4 max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
              About Mixxclub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to make professional audio engineering accessible to every artist, anywhere in the world.
            </p>
          </motion.div>
        </section>

        <div className="container max-w-6xl mx-auto px-4 py-16 space-y-20">
          {/* Mission & Vision */}
          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <GlassPanel glow accent="rgba(168,85,247,0.35)">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To democratize professional audio production by connecting talented artists with
                world-class engineers through an intuitive platform. We believe great music shouldn't
                be held back by limited access to professional mixing and mastering services.
              </p>
            </GlassPanel>

            <GlassPanel glow accent="rgba(6,182,212,0.35)">
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the global standard for collaborative audio production, where artists and
                engineers work together seamlessly regardless of location. We're building the future
                of music production—one that's transparent, efficient, and artist-first.
              </p>
            </GlassPanel>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="relative"
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {/* Ambient glow behind stats */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <GlassPanel hoverable accent={stat.accent} className="text-center">
                    <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Story */}
          <motion.div
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <GlassPanel glow accent="rgba(168,85,247,0.25)" padding="p-8">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Mixxclub was founded in 2024 by a team of audio engineers and software developers who
                  saw the challenges independent artists face in getting professional-quality production.
                  We experienced firsthand the frustration of finding reliable engineers, managing complex
                  project workflows, and ensuring consistent quality.
                </p>
                <p>
                  What started as a simple marketplace has evolved into a comprehensive platform that
                  handles everything from initial project setup to final delivery. We've built tools for
                  real-time collaboration, AI-powered matching, secure payments, and quality assurance—all
                  designed to make the production process as smooth as possible.
                </p>
                <p>
                  Today, Mixxclub serves thousands of artists and engineers worldwide, facilitating millions
                  of dollars in transactions and helping create music that reaches audiences everywhere.
                  We're just getting started.
                </p>
              </div>
            </GlassPanel>
          </motion.div>

          {/* Values */}
          <motion.div
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Quality First', desc: 'Every engineer is vetted, every project is monitored, and every delivery is guaranteed to meet professional standards.', accent: 'rgba(168,85,247,0.35)' },
                { title: 'Transparency', desc: 'Clear pricing, honest timelines, and open communication. No hidden fees, no surprises.', accent: 'rgba(6,182,212,0.35)' },
                { title: 'Artist Success', desc: "Your success is our success. We're here to help you create the best version of your music.", accent: 'rgba(249,115,22,0.35)' },
              ].map((value, i) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                >
                  <GlassPanel hoverable glow accent={value.accent}>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.desc}</p>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <PublicFooter />
      </div>
    </>
  );
}
