import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';
import { ScrollRevealSection } from './ScrollRevealSection';

interface JourneyStep {
  number: number;
  icon: ReactNode;
  title: string;
  description: string;
}

interface JourneyPreviewProps {
  title: string;
  subtitle: string;
  badge: { icon: ReactNode; text: string };
  steps: JourneyStep[];
  variant: 'artist' | 'engineer' | 'producer' | 'fan';
}

export const JourneyPreview = ({ title, subtitle, badge, steps, variant }: JourneyPreviewProps) => {
  const accentColor = variant === 'artist' ? 'primary' : 'secondary';

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

        {/* Journey Path - Glass Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <ScrollRevealSection
              key={step.number}
              delay={index * 0.1}
              direction={index % 2 === 0 ? 'left' : 'right'}
            >
              <motion.div
                className="relative p-6 rounded-2xl bg-background/40 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all group h-full"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                {/* Step Number */}
                <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-${accentColor} to-${accentColor}/70 flex items-center justify-center text-white font-bold shadow-lg`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-${accentColor}/20 border border-${accentColor}/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-${accentColor}`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>

                {/* Connection Line */}
                {index < steps.length - 1 && index % 3 !== 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </motion.div>
            </ScrollRevealSection>
          ))}
        </div>
      </div>
    </section>
  );
};
