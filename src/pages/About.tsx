import { motion } from 'framer-motion';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import Navigation from '@/components/Navigation';
import {
  Users, Headphones, Award, Zap, Disc3, Heart, Music,
  Coins, Globe, Sparkles, Shield, TrendingUp, Star
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { organizationSchema, softwareApplicationSchema } from '@/lib/seo-schema';
import { FAQSection } from '@/components/seo/FAQSection';
import { GlassPanel } from '@/components/crm/design/GlassPanel';
import heroAboutFallback from '@/assets/hero-about.jpg';
import { usePageContent, usePageImage } from '@/hooks/usePageContent';

const sectionAnim = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stats = [
  { icon: Music,      value: '10,000+', label: 'Active Artists',          accent: 'rgba(168,85,247,0.35)' },
  { icon: Headphones, value: '2,500+',  label: 'Professional Engineers',  accent: 'rgba(6,182,212,0.35)'  },
  { icon: Disc3,      value: '500+',    label: 'Beat Producers',          accent: 'rgba(249,115,22,0.35)' },
  { icon: Heart,      value: '25,000+', label: 'Day 1 Fans',              accent: 'rgba(236,72,153,0.35)' },
];

const roles = [
  {
    icon: Music,
    title: 'Artists',
    color: 'rgba(168,85,247,0.35)',
    description:
      'Upload tracks, get AI-matched with engineers, collaborate in real-time, and distribute to 150+ platforms — all from one dashboard. Earn MixxCoinz, build a fanbase, and track every premiere.',
  },
  {
    icon: Headphones,
    title: 'Engineers',
    color: 'rgba(6,182,212,0.35)',
    description:
      'Turn your audio skills into a business with 10 revenue streams, 70–85% splits, a full CRM pipeline, verified reviews, certifications, and integrations with every major DAW and streaming tool.',
  },
  {
    icon: Disc3,
    title: 'Producers',
    color: 'rgba(249,115,22,0.35)',
    description:
      'List your beats on a global marketplace, set custom licensing tiers, collaborate with artists via Beat Forge, and track royalties and revenue in real time — from catalog to chart.',
  },
  {
    icon: Heart,
    title: 'Fans',
    color: 'rgba(236,72,153,0.35)',
    description:
      'Discover underground artists, earn blockchain-verified Day 1 OG status, attend live premieres, collect achievements, and grow your rewards as your favourite artists rise.',
  },
];

const pillars = [
  { icon: Coins,      title: 'MixxCoinz Economy',       desc: 'An ownership economy built into every action. Earn, spend, and unlock platform perks — the more you contribute, the more you own.' },
  { icon: Globe,      title: 'Global Beat Marketplace',  desc: 'Producers list, artists browse, licenses close in seconds. 80%+ revenue splits with instant payouts.' },
  { icon: Sparkles,   title: 'AI Audio Intelligence',    desc: 'From genre tagging to mixing suggestions — our AI enriches every session, track, and collaboration automatically.' },
  { icon: Shield,     title: 'Verified Reviews',         desc: 'Every engineer carries a public reputation score. Real clients, real ratings, verified work history.' },
  { icon: Award,      title: 'Certifications & Growth',  desc: 'Structured learning paths, industry certifications, and a coaching layer designed for audio professionals.' },
  { icon: TrendingUp, title: 'Community Unlockables',    desc: 'As the Mixxclub community grows, features unlock for everyone. Every member is a co-owner of what comes next.' },
];

const values = [
  { title: 'Intention Over Convention',  desc: 'Every feature is deliberate. We do not ship until it elevates the experience for all four roles.', accent: 'rgba(168,85,247,0.35)' },
  { title: 'Ownership Economy',          desc: 'MixxCoinz puts real value in the hands of every creator, engineer, and fan who shows up consistently.', accent: 'rgba(6,182,212,0.35)' },
  { title: 'Built For The Culture',      desc: 'We did not build a generic audio SaaS. We built a home for hip-hop, R&B, afrobeat, and every genre in between.', accent: 'rgba(249,115,22,0.35)' },
];

export default function About() {
  const { content: heroTitle } = usePageContent('about', 'hero_title');
  const { content: heroSubtitle } = usePageContent('about', 'hero_subtitle');
  const { content: heroBadge } = usePageContent('about', 'hero_badge');
  const { content: missionTitle } = usePageContent('about', 'mission_title');
  const { content: missionBody } = usePageContent('about', 'mission_body');
  const { content: visionTitle } = usePageContent('about', 'vision_title');
  const { content: visionBody } = usePageContent('about', 'vision_body');
  const { imageUrl: heroImage } = usePageImage('about', 'hero_image', heroAboutFallback);
  return (
    <>
      <SEOHead
        title="About Mixxclub — The Four-Role Music Ecosystem"
        description="Mixxclub is the complete ecosystem for Artists, Engineers, Producers, and Fans. AI tools, MixxCoinz economy, global beat marketplace, certifications, and live premieres — all in one platform."
        keywords="about mixxclub, music production platform, four role ecosystem, mixxcoinz, beat marketplace, audio engineering"
        schema={[organizationSchema, softwareApplicationSchema]}
        speakableSelectors={['h1', 'h2', '[data-speakable]']}
      />

      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero */}
        <section className="relative h-[60vh] min-h-[420px] flex items-center justify-center overflow-hidden">
          <img
            src={heroImage}
            alt="The Mixxclub four-role ecosystem in action"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

          <motion.div
            className="relative z-10 text-center px-4 max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-primary">
              <Star className="w-3.5 h-3.5" />
              {heroBadge}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent whitespace-pre-line">
              {heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {heroSubtitle}
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
              <h2 className="text-3xl font-bold mb-4">{missionTitle}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {missionBody}
              </p>
            </GlassPanel>
            <GlassPanel glow accent="rgba(6,182,212,0.35)">
              <h2 className="text-3xl font-bold mb-4">{visionTitle}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {visionBody}
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

          {/* Four Roles */}
          <motion.div
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <h2 className="text-3xl font-bold text-center mb-3">Built For All Four Roles</h2>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              Every surface of the platform is designed specifically for the role you play in music. One login, four complete experiences.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {roles.map((role, i) => (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <GlassPanel hoverable glow accent={role.color}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <role.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">{role.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{role.description}</p>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Platform Pillars */}
          <motion.div
            variants={sectionAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <h2 className="text-3xl font-bold text-center mb-3">What Makes Mixxclub Different</h2>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              Six pillars that no other platform combines in one place.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                >
                  <GlassPanel hoverable className="h-full">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <pillar.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
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
                  Mixxclub was born from frustration and ambition. Founder Ravenis Prime — a creator-engineer who lived both sides of the session room — saw a fractured industry: artists struggling to find trustworthy engineers, producers unable to monetize their catalogs, and fans with no real stake in the music they championed.
                </p>
                <p>
                  The answer wasn't another marketplace. It was an ecosystem. One where every role has a home, every contribution has value, and the platform itself grows as the community grows. The MixxCoinz economy, community unlock system, and AI tools were designed from day one to distribute ownership back to the people who make the culture.
                </p>
                <p>
                  Today, Mixxclub serves tens of thousands of creatives worldwide with a four-role platform that covers mixing, mastering, beat licensing, distribution, live sessions, premieres, certifications, and a full economy layer. We're building the future of music — and every member is a co-founder of what comes next.
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
              {values.map((value, i) => (
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
