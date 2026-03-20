/**
 * BlockRenderer — renders a single landing page block by type.
 * Each block type maps to a pure presentational component.
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/crm/design/GlassPanel';
import {
  Zap, Shield, Users, Sparkles, Music, Headphones, Award,
  TrendingUp, Globe, Heart, Star, DollarSign, Disc3, Coins,
  type LucideIcon,
} from 'lucide-react';
import type { LandingBlock } from '@/hooks/useLandingPages';
import { getPageImageUrl } from '@/hooks/usePageContent';

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Shield, Users, Sparkles, Music, Headphones, Award,
  TrendingUp, Globe, Heart, Star, DollarSign, Disc3, Coins,
};

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sparkles;
}

function resolveImage(src: string): string {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return getPageImageUrl(src);
}

const sectionAnim = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

// ─── HERO ─────────────────────────────────────────────
function HeroBlock({ props }: { props: Record<string, any> }) {
  const bgImage = resolveImage(props.backgroundImage || '');
  const align = props.alignment === 'left' ? 'text-left items-start' : 'text-center items-center';

  return (
    <section
      className={`relative ${props.fullHeight ? 'min-h-screen' : 'min-h-[60vh]'} flex ${align} justify-center px-6 py-24 overflow-hidden`}
    >
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}
      {!bgImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
      )}
      {props.overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      )}

      <motion.div
        className={`relative z-10 max-w-4xl ${props.alignment === 'left' ? '' : 'mx-auto'}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {props.badge && (
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            {props.badge}
          </div>
        )}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent whitespace-pre-line leading-tight">
          {props.title}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10">
          {props.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {props.ctaText && (
            <Link to={props.ctaHref || '#'}>
              <Button size="lg" className="text-lg px-8 py-6">
                {props.ctaText}
              </Button>
            </Link>
          )}
          {props.secondaryCtaText && (
            <Link to={props.secondaryCtaHref || '#'}>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-background/30 backdrop-blur-sm border-border/40">
                {props.secondaryCtaText}
              </Button>
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  );
}

// ─── FEATURES GRID ────────────────────────────────────
function FeaturesGridBlock({ props }: { props: Record<string, any> }) {
  let features: any[] = [];
  try { features = typeof props.features === 'string' ? JSON.parse(props.features) : props.features; } catch { /* empty */ }
  const cols = props.columns === '4' ? 'md:grid-cols-4' : props.columns === '2' ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <motion.section
      className="py-20 px-6"
      variants={sectionAnim}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="container max-w-6xl mx-auto">
        {props.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{props.title}</h2>
            {props.subtitle && <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{props.subtitle}</p>}
          </div>
        )}
        <div className={`grid gap-6 ${cols}`}>
          {features.map((f: any, i: number) => {
            const Icon = resolveIcon(f.icon);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <GlassPanel hoverable className="h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

// ─── STATS BAR ────────────────────────────────────────
function StatsBarBlock({ props }: { props: Record<string, any> }) {
  let stats: any[] = [];
  try { stats = typeof props.stats === 'string' ? JSON.parse(props.stats) : props.stats; } catch { /* empty */ }

  return (
    <motion.section
      className="py-12 px-6"
      variants={sectionAnim}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="container max-w-5xl mx-auto">
        <div className={`grid grid-cols-2 md:grid-cols-${stats.length} gap-6 ${props.glassEffect ? 'p-6 rounded-2xl bg-background/30 backdrop-blur-md border border-border/20' : ''}`}>
          {stats.map((s: any, i: number) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────
function TestimonialsBlock({ props }: { props: Record<string, any> }) {
  let testimonials: any[] = [];
  try { testimonials = typeof props.testimonials === 'string' ? JSON.parse(props.testimonials) : props.testimonials; } catch { /* empty */ }

  return (
    <motion.section
      className="py-20 px-6"
      variants={sectionAnim}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="container max-w-6xl mx-auto">
        {props.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{props.title}</h2>
            {props.subtitle && <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{props.subtitle}</p>}
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <GlassPanel glow className="h-full">
                <p className="text-muted-foreground mb-4 italic leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  {t.avatar ? (
                    <img src={resolveImage(t.avatar)} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {(t.name || '?')[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ─── CTA BANNER ───────────────────────────────────────
function CtaBannerBlock({ props }: { props: Record<string, any> }) {
  const variant = props.variant || 'primary';
  const bgClass = variant === 'gradient'
    ? 'bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20'
    : variant === 'glass'
      ? 'bg-background/30 backdrop-blur-md border border-border/20'
      : 'bg-primary/5';

  return (
    <motion.section
      className="py-20 px-6"
      variants={sectionAnim}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className={`container max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center ${bgClass}`}>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">{props.title}</h2>
        {props.subtitle && <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{props.subtitle}</p>}
        {props.ctaText && (
          <Link to={props.ctaHref || '#'}>
            <Button size="lg" className="text-lg px-10 py-6">
              {props.ctaText}
            </Button>
          </Link>
        )}
        {props.disclaimer && (
          <p className="text-xs text-muted-foreground mt-4">{props.disclaimer}</p>
        )}
      </div>
    </motion.section>
  );
}

// ─── IMAGE + TEXT ─────────────────────────────────────
function ImageTextBlock({ props }: { props: Record<string, any> }) {
  const imgSrc = resolveImage(props.image || '');
  const reversed = props.imagePosition === 'left';

  return (
    <motion.section
      className="py-20 px-6"
      variants={sectionAnim}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className={`container max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center ${reversed ? '' : ''}`}>
        <div className={reversed ? 'md:order-2' : ''}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{props.title}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">{props.body}</p>
          {props.ctaText && (
            <Link to={props.ctaHref || '#'}>
              <Button size="lg">{props.ctaText}</Button>
            </Link>
          )}
        </div>
        <div className={reversed ? 'md:order-1' : ''}>
          {imgSrc ? (
            <div className="rounded-2xl overflow-hidden border border-border/20 shadow-xl">
              <img src={imgSrc} alt={props.title} className="w-full h-auto object-cover" loading="lazy" />
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 aspect-video flex items-center justify-center">
              <span className="text-muted-foreground">No image set</span>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

// ─── TEXT SECTION ─────────────────────────────────────
function TextSectionBlock({ props }: { props: Record<string, any> }) {
  const align = props.alignment === 'left' ? 'text-left' : 'text-center';
  const maxW = `max-w-${props.maxWidth || '3xl'}`;

  return (
    <motion.section
      className={`py-16 px-6 ${align}`}
      variants={sectionAnim}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className={`container ${maxW} mx-auto`}>
        {props.title && <h2 className="text-3xl md:text-4xl font-bold mb-6">{props.title}</h2>}
        <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
          {props.body}
        </div>
      </div>
    </motion.section>
  );
}

// ─── SPACER ───────────────────────────────────────────
function SpacerBlock({ props }: { props: Record<string, any> }) {
  return (
    <div style={{ height: `${props.height || 64}px` }} className="relative">
      {props.showDivider && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      )}
    </div>
  );
}

// ─── MAIN RENDERER ────────────────────────────────────
const RENDERERS: Record<string, React.FC<{ props: Record<string, any> }>> = {
  hero: HeroBlock,
  features_grid: FeaturesGridBlock,
  stats_bar: StatsBarBlock,
  testimonials: TestimonialsBlock,
  cta_banner: CtaBannerBlock,
  image_text: ImageTextBlock,
  text_section: TextSectionBlock,
  spacer: SpacerBlock,
};

export function BlockRenderer({ block }: { block: LandingBlock }) {
  const Comp = RENDERERS[block.type];
  if (!Comp) return null;
  return <Comp props={block.props} />;
}
