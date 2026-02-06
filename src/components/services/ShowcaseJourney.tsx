import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  badge: {
    icon: ReactNode;
    text: string;
  };
  title: string;
  subtitle: string;
  steps: ShowcaseStep[];
  variant?: 'artist' | 'engineer';
}

export function ShowcaseJourney({
  badge,
  title,
  subtitle,
  steps,
  variant = 'artist'
}: ShowcaseJourneyProps) {
  const accentColor = variant === 'artist' 
    ? 'hsl(var(--primary))' 
    : 'hsl(180 100% 50%)';

  return (
    <section className="py-16 md:py-24">
      <div className="container px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            {badge.icon}
            <span className="text-sm font-medium text-primary">{badge.text}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16 md:space-y-24">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isReversed = index % 2 !== 0;

            return (
              <motion.div
                key={step.stepNumber}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center`}
              >
                {/* Image Side */}
                <div className="flex-1 w-full relative group">
                  <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-2xl">
                    {/* Step Number Badge */}
                    <div 
                      className="absolute top-4 left-4 z-10 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ 
                        backgroundColor: accentColor,
                        color: variant === 'engineer' ? 'hsl(var(--background))' : 'hsl(var(--primary-foreground))'
                      }}
                    >
                      {step.stepNumber}
                    </div>

                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Stats overlay on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-background via-background/90 to-transparent">
                      <div className="flex gap-3 md:gap-4 flex-wrap">
                        {step.stats.map((stat) => (
                          <div key={stat.label} className="px-3 py-2 md:px-4 md:py-2 bg-background/95 backdrop-blur rounded-lg border border-border">
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                            <div 
                              className="text-base md:text-lg font-bold"
                              style={{ color: accentColor }}
                            >
                              {stat.value}
                            </div>
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
                        className="text-xs shadow-lg"
                        style={{ 
                          backgroundColor: `${accentColor}20`,
                          color: accentColor,
                          borderColor: `${accentColor}30`
                        }}
                      >
                        {detail}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 w-full space-y-4 md:space-y-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 md:p-3 rounded-xl border"
                      style={{ 
                        backgroundColor: `${accentColor}10`,
                        borderColor: `${accentColor}20`
                      }}
                    >
                      <Icon 
                        className="w-5 h-5 md:w-6 md:h-6" 
                        style={{ color: accentColor }}
                      />
                    </div>
                    <Badge variant="secondary" className="text-xs md:text-sm">
                      Step {step.stepNumber}
                    </Badge>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Stats grid - visible by default on mobile */}
                  <div className="grid grid-cols-3 gap-3 md:gap-4 py-2 md:py-4 lg:hidden">
                    {step.stats.map((stat) => (
                      <div key={stat.label} className="text-center p-3 md:p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div 
                          className="text-lg md:text-2xl font-bold"
                          style={{ color: accentColor }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop stats grid */}
                  <div className="hidden lg:grid grid-cols-3 gap-4 py-4">
                    {step.stats.map((stat) => (
                      <div key={stat.label} className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: accentColor }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Tech details */}
                  <div className="flex flex-wrap gap-2">
                    {step.techDetails.map((detail) => (
                      <Badge key={detail} variant="outline" className="text-xs">
                        {detail}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
