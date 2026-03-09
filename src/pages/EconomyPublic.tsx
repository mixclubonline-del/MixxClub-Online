import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Coins, Zap, ShieldCheck, Crown, Music, Headphones, Mic2, Heart,
  ArrowRight, Sparkles, Lock, Gift, TrendingUp, Star, Award, Users
} from 'lucide-react';
import { MixxCoin3D } from '@/components/economy/MixxCoin3D';
import { MixxCoin } from '@/components/economy/MixxCoin';
import { ScrollRevealSection } from '@/components/landing/ScrollRevealSection';
import { PulsingCTA } from '@/components/landing/PulsingCTA';
import { Badge } from '@/components/ui/badge';
import PublicFooter from '@/components/layouts/PublicFooter';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/* ─── Data ─────────────────────────────────────────────────── */

const JOURNEY_STEPS = [
  { icon: <Zap className="w-6 h-6" />, title: 'Earn', description: 'Complete missions, collaborate, upload tracks, and engage with the community to earn MixxCoinz.' },
  { icon: <Coins className="w-6 h-6" />, title: 'Spend', description: 'Use MixxCoinz on premium services — mixing, mastering, distribution, beat licensing, and more.' },
  { icon: <Lock className="w-6 h-6" />, title: 'Unlock', description: 'Permanently unlock platform features. No recurring subscriptions — once unlocked, it\'s yours forever.' },
  { icon: <Crown className="w-6 h-6" />, title: 'Own', description: 'Build equity in the platform. Top earners cash out at 200:1 MixxCoinz-to-USD. Your grind has real value.' },
];

const TIERS = [
  { name: 'Newcomer', range: '0 – 499', color: 'from-muted to-muted/60', icon: <Star className="w-5 h-5" />, perks: ['Access community missions', 'Earn from engagement'] },
  { name: 'Regular', range: '500 – 1,999', color: 'from-primary/60 to-primary/30', icon: <TrendingUp className="w-5 h-5" />, perks: ['5% service discounts', 'Priority queue'] },
  { name: 'Veteran', range: '2,000 – 9,999', color: 'from-accent/60 to-accent/30', icon: <Award className="w-5 h-5" />, perks: ['15% service discounts', 'Exclusive drops', 'Premiere access'] },
  { name: 'Legend', range: '10,000+', color: 'from-amber-500/60 to-amber-400/30', icon: <Crown className="w-5 h-5" />, perks: ['25% service discounts', 'Cash-out eligible', 'VIP everything', 'Revenue share'] },
];

const ROLE_BENEFITS = [
  { role: 'Artists', icon: <Mic2 className="w-7 h-7" />, color: 'primary', earnings: ['Mix & master revenue splits', 'Premiere launch bonuses', 'Fan tip revenue', 'Merch sale commissions'] },
  { role: 'Engineers', icon: <Headphones className="w-7 h-7" />, color: 'accent', earnings: ['Service completion rewards', 'Client tip pass-through', 'Certification bonuses', 'Repeat-client multipliers'] },
  { role: 'Producers', icon: <Music className="w-7 h-7" />, color: 'secondary', earnings: ['Beat sale commissions', 'Royalty stream income', 'Leaderboard prizes', 'Collaboration bonuses'] },
  { role: 'Fans', icon: <Heart className="w-7 h-7" />, color: 'primary', earnings: ['Engagement missions', 'Day-1 supporter rewards', 'Voting participation', 'Community milestones'] },
];

/* ─── Component ────────────────────────────────────────────── */

export default function EconomyPublic() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Authenticated users get the full dashboard
  if (!loading && user) {
    return <Navigate to={ROUTES.ECONOMY} replace />;
  }

  return (
    <>
      <Helmet>
        <title>MixxCoinz Economy — Own Your Value | Mixxclub</title>
        <meta name="description" content="Earn, spend, unlock, and own with MixxCoinz — the ownership economy of Mixxclub. No subscriptions. No middlemen. Your grind, your equity." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground overflow-hidden">
        {/* ─── Hero ───────────────────────────────────────────── */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6">
          {/* Atmospheric background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(var(--primary)/0.12)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,hsl(var(--accent)/0.10)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,hsl(var(--secondary)/0.06)_0%,transparent_60%)]" />
          </div>

          {/* Coin visual */}
          <motion.div
            className="relative w-full max-w-md h-56 md:h-72 mb-8"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <MixxCoin3D type="both" autoRotate />
          </motion.div>

          {/* Headline */}
          <motion.div
            className="text-center relative z-10 max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Badge variant="outline" className="mb-6 bg-background/30 backdrop-blur-md border-border/40 text-sm">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              The Ownership Economy
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Own Your Value
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              MixxCoinz is the platform currency that turns your creativity, collaboration, and engagement into real equity. No subscriptions. No middlemen.
            </p>
            <PulsingCTA
              text="Start Earning"
              icon="sparkles"
              onClick={() => navigate('/auth?signup=true')}
            />
          </motion.div>
        </section>

        {/* ─── Dual Coin Explainer ────────────────────────────── */}
        <section className="py-24 px-6 relative">
          <div className="container mx-auto max-w-5xl">
            <ScrollRevealSection className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Two Coins. One Economy.</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Every MixxCoin has purpose. Earned through effort or purchased for instant access — both hold permanent value.</p>
            </ScrollRevealSection>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Earned Coin */}
              <ScrollRevealSection direction="left" delay={0.1}>
                <div className="relative p-8 rounded-2xl bg-card/40 backdrop-blur-md border border-border/30 hover:border-primary/40 transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <MixxCoin type="earned" size="xl" animated showGlow />
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Earned Coin</h3>
                      <p className="text-sm text-primary font-medium">Soundwave Emblem</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">Won through missions, collaboration, uploads, and community engagement. Your grind minted into currency.</p>
                  <ul className="space-y-2 text-sm">
                    {['Complete daily missions', 'Collaborate on projects', 'Upload original tracks', 'Engage & support artists'].map(item => (
                      <li key={item} className="flex items-center gap-2 text-foreground/80">
                        <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollRevealSection>

              {/* Purchased Coin */}
              <ScrollRevealSection direction="right" delay={0.2}>
                <div className="relative p-8 rounded-2xl bg-card/40 backdrop-blur-md border border-border/30 hover:border-accent/40 transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <MixxCoin type="purchased" size="xl" animated showGlow />
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Premium Coin</h3>
                      <p className="text-sm text-accent font-medium">Crown Emblem</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">Purchased directly for instant access to premium services and unlockables. Skip the grind when you need speed.</p>
                  <ul className="space-y-2 text-sm">
                    {['Instant service access', 'Unlock premium features', 'Gift to collaborators', 'Support the ecosystem'].map(item => (
                      <li key={item} className="flex items-center gap-2 text-foreground/80">
                        <Crown className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollRevealSection>
            </div>
          </div>
        </section>

        {/* ─── How It Works Journey ──────────────────────────── */}
        <section className="py-24 px-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05)_0%,transparent_70%)]" />
          <div className="container mx-auto max-w-5xl relative">
            <ScrollRevealSection className="text-center mb-16">
              <Badge variant="outline" className="mb-4 bg-background/30 backdrop-blur-md border-border/40">
                <Gift className="w-4 h-4 mr-2" />
                Your Journey
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Earn → Spend → Unlock → Own</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Four steps to building real equity in the platform you help create.</p>
            </ScrollRevealSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {JOURNEY_STEPS.map((step, idx) => (
                <ScrollRevealSection key={step.title} delay={idx * 0.1}>
                  <motion.div
                    className="relative p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/20 hover:border-primary/30 transition-all h-full group"
                    whileHover={{ y: -4 }}
                  >
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg">
                      {idx + 1}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </motion.div>
                </ScrollRevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Tier System ────────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <ScrollRevealSection className="text-center mb-16">
              <Badge variant="outline" className="mb-4 bg-background/30 backdrop-blur-md border-border/40">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Tier System
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Rise Through the Ranks</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Your MixxCoinz balance determines your tier. Higher tiers unlock deeper discounts, exclusive access, and cash-out eligibility.</p>
            </ScrollRevealSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TIERS.map((tier, idx) => (
                <ScrollRevealSection key={tier.name} delay={idx * 0.1} direction={idx % 2 === 0 ? 'left' : 'right'}>
                  <motion.div
                    className="relative p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/20 hover:border-border/40 transition-all h-full"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 text-foreground`}>
                      {tier.icon}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{tier.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4 font-mono">{tier.range} coinz</p>
                    <ul className="space-y-1.5">
                      {tier.perks.map(perk => (
                        <li key={perk} className="flex items-center gap-2 text-sm text-foreground/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </ScrollRevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Role Benefits ──────────────────────────────────── */}
        <section className="py-24 px-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,hsl(var(--accent)/0.06)_0%,transparent_60%)]" />
          <div className="container mx-auto max-w-5xl relative">
            <ScrollRevealSection className="text-center mb-16">
              <Badge variant="outline" className="mb-4 bg-background/30 backdrop-blur-md border-border/40">
                <Users className="w-4 h-4 mr-2" />
                For Every Role
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Everyone Eats</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Whether you make the beats, mix the tracks, or fuel the culture — MixxCoinz rewards your contribution.</p>
            </ScrollRevealSection>

            <div className="grid sm:grid-cols-2 gap-6">
              {ROLE_BENEFITS.map((role, idx) => (
                <ScrollRevealSection key={role.role} delay={idx * 0.1}>
                  <div className="relative p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/20 hover:border-border/40 transition-all h-full group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-${role.color}/10 border border-${role.color}/20 flex items-center justify-center text-${role.color} group-hover:scale-110 transition-transform`}>
                        {role.icon}
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{role.role}</h3>
                    </div>
                    <ul className="space-y-2">
                      {role.earnings.map(earn => (
                        <li key={earn} className="flex items-center gap-2 text-sm text-foreground/80">
                          <Coins className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          {earn}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollRevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ──────────────────────────────────────── */}
        <section className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,hsl(var(--primary)/0.08)_0%,transparent_60%)]" />
          <ScrollRevealSection className="text-center relative z-10">
            <motion.div
              className="w-20 h-20 mx-auto mb-8"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MixxCoin type="earned" size="hero" animated showGlow />
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Your Grind. Your Equity.
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Join the ownership economy where every contribution builds real value.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PulsingCTA
                text="Create Account"
                icon="sparkles"
                onClick={() => navigate('/auth?signup=true')}
              />
              <motion.button
                className="px-8 py-3 rounded-lg border-2 border-border/40 text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all font-medium"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(ROUTES.HOW_IT_WORKS)}
              >
                How It Works <ArrowRight className="w-4 h-4 inline ml-2" />
              </motion.button>
            </div>
          </ScrollRevealSection>
        </section>

        <PublicFooter />
      </div>
    </>
  );
}
