import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollRevealSection } from './ScrollRevealSection';
import { ReactNode } from 'react';

interface ShowcaseStat {
  label: string;
  value: string;
}

export interface ShowcaseStep {
  image: string;
  icon: LucideIcon;
  stepNumber: number;
  title: string;
  description: string;
  stats: ShowcaseStat[];
  techDetails: string[];
}

interface ShowcaseJourneyProps {
  badge: { icon: ReactNode; text: string };
  title: string;
  subtitle: string;
  steps: ShowcaseStep[];
  variant: 'artist' | 'engineer' | 'producer' | 'fan';
}

export function ShowcaseJourney({ badge, title, subtitle, steps, variant }: ShowcaseJourneyProps) {
  const isArtist = variant === 'artist';

  return (
    <section className="py-24 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <ScrollRevealSection className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 bg-background/30 backdrop-blur-md border-white/20"
          >
            {badge.icon}
            <span className="ml-2">{badge.text}</span>
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </ScrollRevealSection>

        {/* Journey Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center`}
            >
              {/* Image with step number overlay */}
              <div className="flex-1 w-full relative group">
                <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-2xl">
                  <img
                    src={step.image}
                    alt={`Step ${step.stepNumber}: ${step.title}`}
                    className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Step number badge */}
                  <div className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${isArtist ? 'bg-primary' : 'bg-secondary'}`}>
                    {step.stepNumber}
                  </div>

                  {/* Hover stats overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-background via-background/90 to-transparent">
                    <div className="flex gap-3 md:gap-4 flex-wrap">
                      {step.stats.map((stat) => (
                        <div key={stat.label} className="px-3 py-2 md:px-4 md:py-2 bg-background/95 backdrop-blur rounded-lg border border-border">
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                          <div className={`text-base md:text-lg font-bold ${isArtist ? 'text-primary' : 'text-secondary'}`}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating tech badges */}
                <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 flex flex-wrap gap-2 max-w-xs">
                  {step.techDetails.slice(0, 2).map((detail) => (
                    <Badge
                      key={detail}
                      className={`text-xs shadow-lg ${isArtist ? 'bg-primary/20 text-primary border-primary/30' : 'bg-secondary/20 text-secondary border-secondary/30'}`}
                    >
                      {detail}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content side */}
              <div className="flex-1 w-full space-y-4 md:space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 md:p-3 rounded-xl border ${isArtist ? 'bg-primary/10 border-primary/20' : 'bg-secondary/10 border-secondary/20'}`}>
                    <step.icon className={`w-5 h-5 md:w-6 md:h-6 ${isArtist ? 'text-primary' : 'text-secondary'}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs md:text-sm">Step {step.stepNumber}</Badge>
                </div>

                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{step.title}</h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{step.description}</p>

                {/* Stats grid - visible by default on mobile, hidden on desktop (shown on hover) */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 py-2 md:py-4 lg:hidden">
                  {step.stats.map((stat) => (
                    <div key={stat.label} className="text-center p-3 md:p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className={`text-lg md:text-2xl font-bold ${isArtist ? 'text-primary' : 'text-secondary'}`}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Desktop stats grid */}
                <div className="hidden lg:grid grid-cols-3 gap-4 py-4">
                  {step.stats.map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className={`text-2xl font-bold ${isArtist ? 'text-primary' : 'text-secondary'}`}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Tech details */}
                <div className="flex flex-wrap gap-2">
                  {step.techDetails.map((detail) => (
                    <Badge key={detail} variant="outline" className="text-xs">{detail}</Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
