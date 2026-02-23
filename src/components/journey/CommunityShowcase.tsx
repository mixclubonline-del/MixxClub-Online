import { ReactNode } from 'react';
import { Coins, Lock, Swords, ShoppingBag, GraduationCap, Radio, LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useInView } from '@/hooks/useInView';
import { useDynamicAssets } from '@/hooks/useDynamicAssets';
import CommunityCanvasBackground from './CommunityCanvasBackground';
import CoinScene3D from './CoinScene3D';

// Promo fallback images
import mixxosFallback from '@/assets/promo/mixxos-flow.png';
import cityFallback from '@/assets/promo/mixxtech-city.png';
import battlesFallback from '@/assets/promo/mixing-collaboration.jpg';
import merchFallback from '@/assets/promo/enterprise-whitelabel.jpg';
import learningFallback from '@/assets/promo/engineer-growth-coaching.jpg';
import sessionsFallback from '@/assets/promo/webrtc-collaboration.jpg';

/* ─── CSS animation keyframes injected once ─── */
const STYLE_ID = 'community-showcase-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes cs-reveal-up {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .cs-reveal {
      animation: cs-reveal-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .cs-hidden { opacity: 0; }
  `;
  document.head.appendChild(style);
}

/* ─── types ─── */
interface PillarStat {
  label: string;
  value: string;
}

interface CommunityPillar {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  stats: PillarStat[];
  badges: string[];
  /** Either an image URL string, or 'coin3d' to render the R3F scene */
  visual: string | 'coin3d';
  accentColor: string;
}

/* ─── data ─── */
const ACCENT = {
  multiGradient: 'linear-gradient(135deg, hsl(263 70% 63%), hsl(180 100% 50%), hsl(45 90% 50%), hsl(330 80% 60%))',
  community: 'hsl(263 70% 63%)',
};

/* ─── individual pillar card ─── */
function PillarCard({ pillar, index }: { pillar: CommunityPillar; index: number }) {
  const [ref, isInView] = useInView<HTMLDivElement>({ once: true, threshold: 0.1 });
  const isReversed = index % 2 !== 0;
  const Icon = pillar.icon;

  return (
    <div
      ref={ref}
      className={`${isInView ? 'cs-reveal' : 'cs-hidden'} flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Visual side */}
      <div className="flex-1 w-full relative group">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-2xl">
          {pillar.visual === 'coin3d' ? (
            <CoinScene3D className="min-h-[280px]" />
          ) : (
            <img
              src={pillar.visual}
              alt={pillar.title}
              className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          )}

          {/* Stats overlay on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-background via-background/90 to-transparent">
            <div className="flex gap-3 md:gap-4 flex-wrap">
              {pillar.stats.map((stat) => (
                <div key={stat.label} className="px-3 py-2 md:px-4 md:py-2 bg-background/95 backdrop-blur rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-base md:text-lg font-bold" style={{ color: pillar.accentColor }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating tech badges */}
        <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 flex flex-wrap gap-2 max-w-xs">
          {pillar.badges.slice(0, 2).map((badge) => (
            <Badge
              key={badge}
              className="text-xs shadow-lg"
              style={{
                backgroundColor: `${pillar.accentColor}20`,
                color: pillar.accentColor,
                borderColor: `${pillar.accentColor}30`,
              }}
            >
              {badge}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content side */}
      <div className="flex-1 w-full space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 md:p-3 rounded-xl border"
            style={{ backgroundColor: `${pillar.accentColor}10`, borderColor: `${pillar.accentColor}20` }}
          >
            <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: pillar.accentColor }} />
          </div>
          <Badge variant="secondary" className="text-xs md:text-sm">Community</Badge>
        </div>

        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{pillar.title}</h3>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{pillar.description}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 py-2 md:py-4">
          {pillar.stats.map((stat) => (
            <div key={stat.label} className="text-center p-3 md:p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="text-lg md:text-2xl font-bold" style={{ color: pillar.accentColor }}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* All badges */}
        <div className="flex flex-wrap gap-2">
          {pillar.badges.map((badge) => (
            <Badge key={badge} variant="outline" className="text-xs">{badge}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── main export ─── */
export default function CommunityShowcase() {
  const [headerRef, headerInView] = useInView<HTMLDivElement>({ once: true });
  const { getImageUrl } = useDynamicAssets();

  // Build pillars with dynamic asset resolution
  const pillars: CommunityPillar[] = [
    {
      id: 'mixxcoinz',
      icon: Coins,
      title: 'The Currency of the Culture',
      description:
        'MixxCoinz power everything. Engineers cash out earnings. Fans invest in artists. Producers earn royalties. Artists unlock features. Two coin types — Earned through contribution, Purchased for instant access — fuel a creator-owned economy where your work has real value.',
      stats: [
        { label: 'Earn Rate', value: 'Every Action' },
        { label: 'Cash Out', value: '200:1 USD' },
        { label: 'Types', value: 'Earned + Purchased' },
      ],
      badges: ['Dual Currency', 'Instant Payouts', 'Ownership Model', 'Escrow System'],
      visual: 'coin3d',
      accentColor: 'hsl(45 90% 50%)',
    },
    {
      id: 'unlockables',
      icon: Lock,
      title: 'Unlock Your Level',
      description:
        'Five progression paths — one for every role, plus a shared Community track. Every upload, review, collaboration, and vote moves you up the ladder. Collective milestones unlock platform-wide features. Personal milestones unlock exclusive role rewards and Vault Room access.',
      stats: [
        { label: 'Paths', value: '5 Roles' },
        { label: 'Tiers', value: '5 Per Path' },
        { label: 'Goals', value: 'Community + Personal' },
      ],
      badges: ['Progression Matrix', 'Collective Goals', 'Role Rewards', 'Vault Room'],
      visual: getImageUrl('community_unlockables', cityFallback),
      accentColor: 'hsl(263 70% 63%)',
    },
    {
      id: 'battles',
      icon: Swords,
      title: 'Prove Your Sound',
      description:
        'Head-to-head mixing battles, beat competitions, remix challenges — all judged by the community. Engineers flex skills, producers compete for placement, fans earn MixxCoinz for voting. The leaderboard tracks who\'s really running the sound.',
      stats: [
        { label: 'Formats', value: '1v1 + Open' },
        { label: 'Voting', value: 'Community' },
        { label: 'Prizes', value: 'MixxCoinz + Status' },
      ],
      badges: ['Live Battles', 'Remix Challenges', 'Leaderboards', 'Judge and Earn'],
      visual: getImageUrl('community_battles', battlesFallback),
      accentColor: 'hsl(350 80% 55%)',
    },
    {
      id: 'merch',
      icon: ShoppingBag,
      title: 'Sell What You Create',
      description:
        'Every creator gets a built-in storefront. Sell beats, presets, sample packs, physical merch, digital goods — no third-party platforms needed. Fans buy with MixxCoinz or USD. Zero platform commission on merch because your hustle is yours.',
      stats: [
        { label: 'Products', value: 'Unlimited' },
        { label: 'Payment', value: 'USD + MixxCoinz' },
        { label: 'Commission', value: '0% Fee' },
      ],
      badges: ['Beat Store', 'Preset Packs', 'Physical Merch', 'Digital Goods'],
      visual: getImageUrl('community_merch', merchFallback),
      accentColor: 'hsl(160 84% 40%)',
    },
    {
      id: 'learning',
      icon: GraduationCap,
      title: 'Level Up Your Craft',
      description:
        'Tutorials from top engineers, production masterclasses, mixing breakdowns, certification programs. Learn from the community\'s best and earn MixxCoinz for completing courses. Your education earns while you grow.',
      stats: [
        { label: 'Courses', value: 'Growing' },
        { label: 'Instructors', value: 'Verified Pros' },
        { label: 'Earn', value: 'MixxCoinz/Course' },
      ],
      badges: ['Masterclasses', 'Certifications', 'Mixing Breakdowns', 'Community Teachers'],
      visual: getImageUrl('community_learning', learningFallback),
      accentColor: 'hsl(180 100% 50%)',
    },
    {
      id: 'sessions',
      icon: Radio,
      title: 'Watch It Happen Live',
      description:
        'Real-time collaborative sessions, listening parties, album premieres, AMA events. The community gathers around music being made — not just music already released. Pull up a chair and watch the magic happen.',
      stats: [
        { label: 'Latency', value: '<50ms' },
        { label: 'Capacity', value: 'Unlimited' },
        { label: 'Events', value: 'Daily' },
      ],
      badges: ['Real-Time Collab', 'Listening Parties', 'Album Premieres', 'AMA Events'],
      visual: getImageUrl('community_sessions', sessionsFallback),
      accentColor: 'hsl(330 80% 60%)',
    },
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Canvas particle background */}
      <CommunityCanvasBackground />

      <div className="container px-6 relative z-10">
        {/* Section header */}
        <div
          ref={headerRef}
          className={`text-center mb-12 md:mb-16 ${headerInView ? 'cs-reveal' : 'cs-hidden'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Coins className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">The Community Layer</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            When{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: ACCENT.multiGradient }}
            >
              the Community
            </span>{' '}
            Comes Together
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Beyond the individual journeys, these shared systems connect every artist, engineer, producer, and fan into one living ecosystem.
          </p>
        </div>

        {/* Pillar cards */}
        <div className="space-y-16 md:space-y-24">
          {pillars.map((pillar, index) => (
            <PillarCard key={pillar.id} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
